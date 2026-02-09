// app.js - Cleaned implementation with duplicate booking prevention and payment flow
const App = {
    state: {
        currentScreen: 'home',
        selectedType: null, // 'Tratamientos' or 'Depilación'
        cart: [], // Array of service IDs
        history: ['home'],
        activeVariants: {}, // Persistent state for grouped services { baseName: selectedId }
        lastScrollY: 0
    },

    init: () => {
        // Automatic Cloud Sync on load
        DataManager.syncFromCloud();
        DataManager.syncSettingsFromCloud();

        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.addEventListener('change', e => {
                const dateStr = e.target.value;
                const [y, m, d] = dateStr.split('-').map(Number);
                const selectedDate = new Date(y, m - 1, d);


                App.generateSlots(dateStr);
            });
        }
        // Scroll listener for header
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            const currentScrollY = window.scrollY;

            // Smart Header logic
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
                if (currentScrollY > App.state.lastScrollY && currentScrollY > 200) {
                    // Scrolling down - hide header
                    header.classList.add('header-hidden');
                } else {
                    // Scrolling up - show header
                    header.classList.remove('header-hidden');
                }
            } else {
                header.classList.remove('scrolled');
                header.classList.remove('header-hidden');
            }
            App.state.lastScrollY = currentScrollY;
        });
    },

    navigate: (screenId) => {
        if (screenId === 'services' && !App.state.selectedType) {
            screenId = 'home';
        }
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`${screenId}-screen`);
        if (target) target.classList.add('active');
        App.state.currentScreen = screenId;
        if (screenId !== App.state.history[App.state.history.length - 1]) {
            App.state.history.push(screenId);
        }
        window.scrollTo(0, 0);
    },

    goBack: () => {
        if (App.state.history.length > 1) {
            App.state.history.pop();
            const previous = App.state.history[App.state.history.length - 1];
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(`${previous}-screen`);
            if (target) target.classList.add('active');
            App.state.currentScreen = previous;
        } else {
            App.navigate('home');
        }
    },

    selectMainCategory: (type) => {
        App.state.selectedType = type;
        App.navigate('services');
        App.renderServices(type);
    },

    renderServices: (type) => {
        if (!type) return;
        const container = document.getElementById('services-container');
        if (!container) return;
        const settings = DataManager.getSettings();
        const mode = settings.categoryModes[type] || 'open';
        const today = new Date().toISOString().split('T')[0];
        let isClosed = false;
        if (mode === 'manual') {
            const futureDates = settings.allowedDates.filter(d => d.category === type && d.date >= today);
            if (futureDates.length === 0) isClosed = true;
        }
        document.getElementById('service-category-title').textContent = type;
        container.innerHTML = '';
        if (isClosed) {
            const notifyDiv = document.createElement('div');
            notifyDiv.style.gridColumn = '1 / -1';
            notifyDiv.className = 'notify-box';
            notifyDiv.innerHTML = `
                <div style="background: rgba(249, 249, 249, 0.8); border: 1px solid rgba(26, 46, 28, 0.1); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 2rem;">
                    <h3 style="color: var(--forest-green); margin-bottom: 1rem;">Agenda No Disponible</h3>
                    <p style="margin-bottom: 1rem;">Por el momento no hay agenda disponible para estos servicios. Si querés te avisamos cuando habilitemos nuevos turnos.</p>
                    <div style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto;">
                        <input type="email" id="notify-email" placeholder="Tu email" class="form-control" style="margin-bottom: 0;">
                        <button onclick="App.registerLead('${type}')" class="btn-confirm" style="width: auto; margin: 0; white-space: nowrap;">Avisarme</button>
                    </div>
                </div>
            `;
            container.appendChild(notifyDiv);
        } else if (mode === 'manual') {
            const futureDates = settings.allowedDates
                .filter(d => d.category === type && d.date >= today)
                .map(d => d.date)
                .sort();
            if (futureDates.length > 0) {
                const dateList = futureDates.map(d => {
                    const [year, month, day] = d.split('-');
                    return `${day}/${month}`;
                }).join(', ');
                const datesDiv = document.createElement('div');
                datesDiv.style.gridColumn = '1 / -1';
                datesDiv.className = 'notify-box';
                datesDiv.innerHTML = `
                    <div style="background: rgba(249, 249, 249, 0.8); border: 1px solid rgba(26, 46, 28, 0.1); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 2rem;">
                        <h3 style="color: var(--forest-green); margin-bottom: 1rem;">Próximas Fechas Disponibles</h3>
                        <p style="margin-bottom: 0; font-size: 1.1rem; color: var(--text-main);">${dateList}</p>
                    </div>
                `;
                container.appendChild(datesDiv);
            }
        }
        const services = DataManager.getServices().filter(s => s.type === type);
        const categories = [...new Set(services.map(s => s.category))];

        categories.forEach(cat => {
            const catHeader = document.createElement('h3');
            catHeader.textContent = cat;
            catHeader.style.gridColumn = '1 / -1';
            catHeader.style.marginTop = '1.5rem';
            catHeader.style.fontSize = '2.1rem'; // Increased for subcategory titles as requested
            catHeader.style.color = 'var(--forest-green)';
            if (isClosed) catHeader.style.opacity = '0.5';
            container.appendChild(catHeader);

            const catServices = services.filter(s => s.category === cat);

            // Grouping logic for multi-zone services
            const groups = {};
            const ungrouped = [];

            catServices.forEach(s => {
                const zoneMatch = s.subcategory.match(/(.*)\s\((.*Zona.*)\)/i);
                if (zoneMatch) {
                    const baseName = zoneMatch[1].trim();
                    const zoneName = zoneMatch[2].trim();
                    if (!groups[baseName]) groups[baseName] = [];
                    groups[baseName].push({ id: s.id, zone: zoneName, price: s.price, duration: s.duration, description: s.description, gender: s.gender });
                } else {
                    ungrouped.push(s);
                }
            });

            // Render Groups
            Object.entries(groups).forEach(([baseName, variants]) => {
                const card = document.createElement('div');

                // Get the persistent selected variant or default to the first one in the group
                const selectedVariantId = App.state.activeVariants[baseName] ||
                    variants.find(v => App.state.cart.includes(v.id))?.id ||
                    variants[0].id;

                const activeVariant = variants.find(v => v.id === selectedVariantId);
                const isSelected = variants.some(v => App.state.cart.includes(v.id));

                card.className = `service-card ${isSelected ? 'selected' : ''}`;
                if (isClosed) {
                    card.style.opacity = '0.5';
                    card.style.pointerEvents = 'none';
                    card.style.filter = 'grayscale(1)';
                }

                card.innerHTML = `
                    <h3 style="margin-bottom: 0.5rem;">${baseName}</h3>
                    <div style="margin-bottom: 1rem;">
                        <select class="form-control variant-selector" style="padding: 0.5rem; font-size: 0.9rem; border-color: var(--forest-green);">
                            ${variants.map(v => `<option value="${v.id}" ${v.id === selectedVariantId ? 'selected' : ''}>${v.zone} - $${v.price.toLocaleString()}</option>`).join('')}
                        </select>
                    </div>
                    <p class="service-description" style="margin-bottom: 1.5rem;">${activeVariant.description || ''}</p>
                    <div class="service-meta">
                        <span>${activeVariant.gender} • ${activeVariant.duration} min</span>
                        <span class="service-price">$${activeVariant.price.toLocaleString()}</span>
                    </div>
                    <button class="btn-confirm" style="margin-top: 1rem; padding: 0.8rem; font-size: 1rem; cursor: pointer;">
                        ${isSelected ? 'QUITAR' : 'SELECCIONAR'}
                    </button>
                `;

                // Handle select change
                const selector = card.querySelector('.variant-selector');
                selector.onclick = (e) => e.stopPropagation();
                selector.onchange = (e) => {
                    const newId = e.target.value;
                    App.state.activeVariants[baseName] = newId; // Save to persistent state

                    if (isSelected) {
                        // If already selected, swap the ID in the cart
                        const oldId = variants.find(v => App.state.cart.includes(v.id))?.id;
                        if (oldId && oldId !== newId) {
                            App.state.cart = App.state.cart.map(id => id === oldId ? newId : id);
                            App.updateCartUI();
                        }
                    }
                    App.renderServices(type); // Re-render to update metadata
                };

                // Handle toggle
                const toggleBtn = card.querySelector('.btn-confirm');
                toggleBtn.onclick = (e) => {
                    e.stopPropagation();
                    const currentId = selector.value;
                    App.state.activeVariants[baseName] = currentId; // Ensure state is synced
                    App.toggleService(currentId);
                };

                card.onclick = () => {
                    const currentId = selector.value;
                    App.state.activeVariants[baseName] = currentId;
                    App.toggleService(currentId);
                };

                container.appendChild(card);
            });

            // Render Ungrouped
            ungrouped.forEach(service => {
                const card = document.createElement('div');
                const isSelected = App.state.cart.includes(service.id);
                card.className = `service-card ${isSelected ? 'selected' : ''}`;
                if (isClosed) {
                    card.style.opacity = '0.5';
                    card.style.pointerEvents = 'none';
                    card.style.filter = 'grayscale(1)';
                }
                card.innerHTML = `
                    <h3 style="margin-bottom: 0.5rem;">${service.subcategory}</h3>
                    ${service.description ? `<p class="service-description" style="margin-bottom: 1.5rem;">${service.description}</p>` : ''}
                    <div class="service-meta">
                        <span>${service.gender} • ${service.duration} min</span>
                        <span class="service-price">$${service.price.toLocaleString()}</span>
                    </div>
                    <button class="btn-confirm" style="margin-top: 1rem; padding: 0.8rem; font-size: 1rem; cursor: pointer;">
                        ${isSelected ? 'QUITAR' : 'SELECCIONAR'}
                    </button>
                `;

                const toggleBtn = card.querySelector('.btn-confirm');
                toggleBtn.onclick = (e) => {
                    e.stopPropagation();
                    App.toggleService(service.id);
                };

                card.onclick = () => {
                    if (!isClosed) App.toggleService(service.id);
                };

                container.appendChild(card);
            });
        });
    },

    registerLead: (category) => {
        const email = document.getElementById('notify-email').value;
        if (!email || !email.includes('@')) {
            alert('Por favor ingrese un email válido.');
            return;
        }
        const leads = DataManager.getLeads();
        leads.push({ date: new Date().toISOString(), email, category });
        DataManager.saveLeads(leads);
        alert('¡Gracias! Te avisaremos cuando haya turnos disponibles.');
        document.getElementById('notify-email').value = '';
    },

    toggleService: (id) => {
        const idx = App.state.cart.indexOf(id);
        if (idx === -1) {
            App.state.cart.push(id);
        } else {
            App.state.cart.splice(idx, 1);
        }
        App.renderServices(App.state.selectedType);
        App.updateCartUI();
    },

    calculateTotalDuration: (selectedServiceIds) => {
        const allServices = DataManager.getServices();
        const selectedServices = selectedServiceIds.map(id => allServices.find(s => s.id === id)).filter(Boolean);

        if (selectedServices.length === 0) return 0;

        // Group 1: Criolipolisis or Electrodos
        const group1 = selectedServices.filter(s =>
            s.subcategory.toLowerCase().includes('criolipolisis') ||
            s.subcategory.toLowerCase().includes('electrodos')
        );
        const group1Duration = group1.reduce((sum, s) => sum + s.duration, 0);

        // Group 2: Facial or Cejas y Pestañas
        const group2 = selectedServices.filter(s =>
            s.category === 'Facial' ||
            s.type === 'Cejas y Pestañas'
        );
        const group2Duration = group2.reduce((sum, s) => sum + s.duration, 0);

        // Group 3: Ultracavitador, Vela, Radiofrecuencia corporal
        const group3 = selectedServices.filter(s =>
            s.subcategory.toLowerCase().includes('ultracavitador') ||
            s.subcategory.toLowerCase().includes('vela') ||
            (s.subcategory.toLowerCase().includes('radiofrecuencia') && s.category === 'Corporal')
        );
        const group3Duration = group3.reduce((sum, s) => sum + s.duration, 0);

        // Group 4: Fototerapia
        const group4 = selectedServices.filter(s =>
            s.subcategory.toLowerCase().includes('fototerapia')
        );
        const group4Duration = group4.reduce((sum, s) => sum + s.duration, 0);

        // Others
        const others = selectedServices.filter(s =>
            !group1.includes(s) && !group2.includes(s) && !group3.includes(s) && !group4.includes(s)
        );
        const othersDuration = others.reduce((sum, s) => sum + s.duration, 0);

        let total = othersDuration;

        // Logic: Group 1 and Group 2 complement (Max)
        if (group1.length > 0 && group2.length > 0) {
            total += Math.max(group1Duration, group2Duration);
        } else {
            total += group1Duration + group2Duration;
        }

        // Logic: Group 3 and Group 4 complement (Max)
        if (group3.length > 0 && group4.length > 0) {
            total += Math.max(group3Duration, group4Duration);
        } else {
            total += group3Duration + group4Duration;
        }

        return total;
    },

    updateCartUI: () => {
        const count = App.state.cart.length;
        const btn = document.getElementById('btn-continue-booking');
        document.getElementById('cart-count').textContent = count;
        btn.style.display = count > 0 ? 'inline-block' : 'none';
        // Update booking summary
        const list = document.getElementById('booking-list');
        list.innerHTML = '';
        let totalTime = App.calculateTotalDuration(App.state.cart);
        let totalPrice = 0;
        const allServices = DataManager.getServices();
        App.state.cart.forEach(id => {
            const service = allServices.find(s => s.id === id);
            if (service) {
                totalPrice += service.price;
                const li = document.createElement('li');
                li.style.marginBottom = '0.5rem';
                li.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${service.subcategory} (${service.category})</span><span>$${service.price.toLocaleString()}</span></div>`;
                list.appendChild(li);
            }
        });
        document.getElementById('total-time').textContent = `${totalTime} min`;
        document.getElementById('total-price').textContent = `$${totalPrice.toLocaleString()}`;
        // Reset slots if cart changes
        document.getElementById('slots-container').innerHTML = '';
        document.getElementById('booking-time').value = '';
        if (document.getElementById('booking-date').value) {
            App.generateSlots(document.getElementById('booking-date').value);
        }
    },

    generateSlots: (dateStr) => {
        const container = document.getElementById('slots-container');
        container.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">Calculando disponibilidad...</p>';
        document.getElementById('booking-time').value = '';
        const bookings = DataManager.getBookings();
        const allServices = DataManager.getServices();
        let totalDuration = App.calculateTotalDuration(App.state.cart);
        if (totalDuration === 0) {
            container.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">Seleccione servicios primero.</p>';
            return;
        }

        // Verify category availability
        const settings = DataManager.getSettings();
        const disallowed = App.state.cart.some(id => {
            const srv = allServices.find(s => s.id === id);
            if (!srv) return false;
            const mode = settings.categoryModes[srv.type] || 'open';
            if (mode === 'manual') {
                return !settings.allowedDates.some(d => d.category === srv.type && d.date === dateStr);
            }
            return false;
        });
        if (disallowed) {
            container.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">La categoría seleccionada no está disponible en la fecha elegida.</p>';
            return;
        }
        const startHour = 8;
        const endHour = 20;
        const dayStart = startHour * 60;
        const dayEnd = endHour * 60;
        const dayBookings = bookings.filter(b => b.date === dateStr);
        const toMinutes = t => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const toTimeStr = mins => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };
        const slots = [];
        for (let time = dayStart; time + totalDuration <= dayEnd; time += 30) {
            const slotStart = time;
            const slotEnd = time + totalDuration;
            let blocked = false;
            // Existing bookings
            for (const booking of dayBookings) {
                const bStart = toMinutes(booking.time);
                const bEnd = bStart + booking.duration;
                if (slotStart < bEnd && slotEnd > bStart) {
                    blocked = true;
                    break;
                }
            }
            // Blocked ranges
            if (!blocked && settings.blockedRanges) {
                const dayRanges = settings.blockedRanges.filter(r => r.date === dateStr);
                for (const range of dayRanges) {
                    const rStart = toMinutes(range.start);
                    const rEnd = toMinutes(range.end);
                    if (slotStart < rEnd && slotEnd > rStart) {
                        blocked = true;
                        break;
                    }
                }
            }
            if (!blocked) slots.push(toTimeStr(slotStart));
        }
        container.innerHTML = '';
        if (slots.length === 0) {
            container.innerHTML = '<p class="text-muted" style="grid-column:1/-1;">No hay turnos disponibles para la duración total seleccionada.</p>';
            return;
        }
        slots.forEach(time => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.style.width = '100%';
            btn.style.fontSize = '1.1rem';
            btn.style.padding = '1rem';
            btn.style.borderColor = 'var(--forest-green)';
            btn.style.color = 'var(--forest-green)';
            btn.textContent = time;
            btn.onclick = e => {
                e.preventDefault();
                document.querySelectorAll('#slots-container button').forEach(b => {
                    b.style.backgroundColor = 'transparent';
                    b.style.color = 'var(--forest-green)';
                    b.style.transform = 'scale(1)';
                });
                btn.style.backgroundColor = 'var(--sage-green)';
                btn.style.color = '#fff';
                btn.style.transform = 'scale(1.05)';
                document.getElementById('booking-time').value = time;
            };
            container.appendChild(btn);
        });
    },

    confirmBooking: (e) => {
        e.preventDefault();
        const name = document.getElementById('client-name').value;
        const phone = document.getElementById('client-phone').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;

        if (App.state.cart.length === 0) {
            alert('Por favor seleccione al menos un servicio.');
            return;
        }
        if (!time) {
            alert('Por favor seleccione un horario de turno.');
            return;
        }

        // Phone validation (at least 10 digits)
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            alert('Por favor ingrese un número de teléfono válido (al menos 10 dígitos incluyendo el código de área).');
            return;
        }

        if (!name || !phone || !date) {
            alert('Por favor complete todos los datos del formulario.');
            return;
        }

        const settings = DataManager.getSettings();
        const allServices = DataManager.getServices();
        let totalTime = App.calculateTotalDuration(App.state.cart);
        let totalPrice = 0;
        App.state.cart.forEach(id => {
            const srv = allServices.find(s => s.id === id);
            if (srv) totalPrice += srv.price;
        });

        if (settings.blockedDays.includes(date)) {
            alert('Lo sentimos, el día seleccionado no está disponible.');
            return;
        }
        // Category manual mode check
        if (settings.categoryModes) {
            const cartServices = App.state.cart.map(id => allServices.find(s => s.id === id)).filter(Boolean);
            const typesInCart = [...new Set(cartServices.map(s => s.type))];
            for (const type of typesInCart) {
                const mode = settings.categoryModes[type] || 'open';
                if (mode === 'manual') {
                    const isAllowed = settings.allowedDates.some(d => d.category === type && d.date === date);
                    if (!isAllowed) {
                        alert(`La categoría "${type}" no tiene turnos habilitados para la fecha seleccionada.`);
                        return;
                    }
                }
            }
        }
        // Blocked ranges check
        if (settings.blockedRanges) {
            const [h, m] = time.split(':').map(Number);
            const startMins = h * 60 + m;
            const endMins = startMins + totalTime;
            const isBlocked = settings.blockedRanges.some(r => {
                if (r.date !== date) return false;
                const [rh, rm] = r.start.split(':').map(Number);
                const [reh, rem] = r.end.split(':').map(Number);
                const rStart = rh * 60 + rm;
                const rEnd = reh * 60 + rem;
                return startMins < rEnd && endMins > rStart;
            });
            if (isBlocked) {
                alert('Lo sentimos, el horario seleccionado entra en conflicto con un bloqueo administrativo.');
                return;
            }
        }

        // Calculate 50% deposit
        const depositAmount = totalPrice * 0.5;
        const formattedDeposit = depositAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

        // Show confirmation modal
        let depositMsg = settings.depositMessage || 'Para confirmar tu turno es necesario abonar una seña.';
        if (depositMsg.includes('{monto_seña}')) {
            depositMsg = depositMsg.replace('{monto_seña}', formattedDeposit);
        } else {
            depositMsg += ` El monto de la seña es de ${formattedDeposit} (50% del total).`;
        }
        document.getElementById('modal-deposit-message').textContent = depositMsg;
        const mpLinkBtn = document.getElementById('modal-mp-link');
        const bankContainer = document.getElementById('bank-details-container');

        if (settings.mpLink) {
            mpLinkBtn.href = settings.mpLink;
            mpLinkBtn.style.display = 'inline-block';
        } else {
            mpLinkBtn.style.display = 'none';
        }

        if (settings.bankName || settings.bankAlias || settings.bankCbu) {
            document.getElementById('modal-bank-name').textContent = settings.bankName || '-';
            document.getElementById('modal-bank-alias').textContent = settings.bankAlias || '-';
            document.getElementById('modal-bank-cbu').textContent = settings.bankCbu || '-';
            document.getElementById('modal-bank-holder').textContent = settings.bankHolder || '-';
            bankContainer.style.display = 'block';
        } else {
            bankContainer.style.display = 'none';
        }

        document.getElementById('modal-policies-text').textContent = settings.policiesText || 'No hay políticas definidas.';
        document.getElementById('accept-policies').checked = false;
        document.getElementById('receipt-file').value = ''; // Reset file input
        document.getElementById('booking-confirmation-modal').style.display = 'flex';
    },

    finalizeBooking: async () => {
        if (!document.getElementById('accept-policies').checked) {
            alert('Debes aceptar las políticas de reserva para continuar.');
            return;
        }

        const receiptInput = document.getElementById('receipt-file');
        if (receiptInput.files.length === 0) {
            alert('Por favor adjunta el comprobante de pago para finalizar.');
            return;
        }

        // Show loading state
        const confirmBtn = document.querySelector('#booking-confirmation-modal .btn-confirm[onclick="App.finalizeBooking()"]');
        const originalBtnText = confirmBtn.textContent;
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'PROCESANDO...';

        try {
            // Gather data from inputs
            const name = document.getElementById('client-name').value;
            const phone = document.getElementById('client-phone').value;
            const date = document.getElementById('booking-date').value;
            const time = document.getElementById('booking-time').value;

            const allServices = DataManager.getServices();
            let totalTime = App.calculateTotalDuration(App.state.cart);
            let totalPrice = 0;
            const serviceNames = [];
            App.state.cart.forEach(id => {
                const service = allServices.find(s => s.id === id);
                if (service) {
                    totalPrice += service.price;
                    serviceNames.push(service.subcategory);
                }
            });

            // Duplicate booking check
            const bookings = DataManager.getBookings();
            const conflict = bookings.some(b => b.date === date && b.time === time);
            if (conflict) {
                throw new Error('El horario seleccionado ya no está disponible. Por favor elige otro.');
            }

            // Convert file to base64
            const receiptFile = receiptInput.files[0];
            let receiptBase64 = "";
            try {
                receiptBase64 = await App.fileToBase64(receiptFile);
            } catch (err) {
                throw new Error('Error al procesar el archivo del comprobante.');
            }

            const newBooking = {
                id: Date.now().toString(),
                date,
                time,
                duration: totalTime,
                services: serviceNames,
                client: { name, phone },
                price: totalPrice,
                status: 'confirmed',
                receipt: receiptBase64,
                receiptName: receiptFile.name,
                timestamp: new Date().toISOString()
            };

            // Save locally (WITHOUT the heavy receipt to avoid Quota Exceeded error)
            const localBooking = { ...newBooking };
            delete localBooking.receipt; // Remove the Base64 image from local storage

            bookings.push(localBooking);

            try {
                DataManager.saveBookings(bookings);
            } catch (storageError) {
                console.error('Storage full, cleaning up old bookings...');
                // If still failing, keep only the last 50 bookings
                const limitedBookings = bookings.slice(-50);
                DataManager.saveBookings(limitedBookings);
            }

            // Sync with Google Sheets
            const settings = DataManager.getSettings();
            if (settings.googleScriptUrl) {
                try {
                    await fetch(settings.googleScriptUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(newBooking)
                    });
                } catch (err) {
                    console.warn('Sync warning:', err);
                }
            }

            // Close modal
            document.getElementById('booking-confirmation-modal').style.display = 'none';

            // Show success feedback
            const successDiv = document.createElement('div');
            Object.assign(successDiv.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'var(--sage-green)', zIndex: '5000',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', color: 'var(--forest-green)', padding: '2rem', textAlign: 'center',
                overflowY: 'auto',
                backgroundImage: 'linear-gradient(135deg, var(--sage-green-light) 0%, var(--sage-green) 100%)'
            });

            successDiv.innerHTML = `
                <div style="max-width: 600px; width: 95%; background: #fff; padding: clamp(1.5rem, 5vw, 4rem); border-radius: 20px; border: 3px solid var(--forest-green); box-shadow: 0 20px 60px rgba(0,0,0,0.1); margin: 2rem auto;">
                    <div style="font-size: clamp(3rem, 10vw, 5rem); color: var(--forest-green); margin-bottom: 1rem;">✓</div>
                    <h1 style="color: var(--forest-green); font-size: clamp(1.5rem, 5vw, 2.5rem); margin-bottom: 1rem;">¡Reserva Exitosa!</h1>
                    <p style="font-size: clamp(1rem, 3vw, 1.3rem); margin-bottom: 1rem; line-height: 1.6;">Tu turno ha sido agendado correctamente.</p>
                    <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem); color: var(--text-muted); margin-bottom: 2rem;">Te esperamos el día <strong>${date}</strong> a las <strong>${time}</strong> hs.</p>
                    <button class="btn-confirm" style="width:auto; padding:1rem 2.5rem;" onclick="location.reload();">VOLVER AL INICIO</button>
                </div>
            `;
            document.body.appendChild(successDiv);
        } catch (error) {
            console.error('Finalize error:', error);
            alert('ERROR: ' + error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalBtnText;
        }
    },

    fileToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
};

document.addEventListener('DOMContentLoaded', App.init);
