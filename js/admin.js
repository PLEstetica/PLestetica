const Admin = {
    isLoggedIn: false,
    filterType: 'all',

    // Authentication
    login: () => {
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        const storedAdmin = DataManager.getAdmin();
        if (user === storedAdmin.username && pass === storedAdmin.password) {
            Admin.isLoggedIn = true;
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'grid';
            Admin.renderServicesList();
            Admin.renderAgenda();
            Admin.renderBlocking();
            Admin.loadSettings();
        } else {
            alert('Credenciales incorrectas');
        }
    },

    logout: () => {
        Admin.isLoggedIn = false;
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('admin-user').value = '';
        document.getElementById('admin-pass').value = '';
    },

    // Tab navigation
    showTab: (tabId) => {
        document.querySelectorAll('.admin-content > div').forEach(el => el.style.display = 'none');
        document.getElementById(`tab-${tabId}`).style.display = 'block';
        document.querySelectorAll('.admin-menu-item').forEach(el => el.classList.remove('active'));
        if (event && event.target) {
            if (event.target.classList.contains('admin-menu-item')) {
                event.target.classList.add('active');
            } else {
                event.target.closest('.admin-menu-item')?.classList.add('active');
            }
        }
        // Refresh data when switching tabs
        if (tabId === 'services') Admin.renderServicesList();
        if (tabId === 'agenda') Admin.renderAgenda();
        if (tabId === 'blocking') Admin.renderBlocking();
    },

    // Services Management
    renderServicesList: () => {
        const services = DataManager.getServices();
        const container = document.getElementById('admin-services-list');
        container.innerHTML = '';

        // Category Filter
        const filterDiv = document.createElement('div');
        filterDiv.style.marginBottom = '1.5rem';
        filterDiv.style.background = '#f9f9f9';
        filterDiv.style.padding = '1rem';
        filterDiv.style.borderRadius = '12px';
        filterDiv.style.display = 'flex';
        filterDiv.style.alignItems = 'center';
        filterDiv.style.gap = '1rem';

        filterDiv.innerHTML = `
            <label style="font-weight: 700; font-size: 0.8rem; color: var(--forest-green); text-transform: uppercase;">Filtrar por Categoría:</label>
            <select onchange="Admin.filterType = this.value; Admin.renderServicesList();" class="form-control" style="width: auto; padding: 0.5rem 1rem;">
                <option value="all" ${Admin.filterType === 'all' ? 'selected' : ''}>TODOS LOS SERVICIOS</option>
                <option value="Tratamientos (Faciales y Corporales)" ${Admin.filterType === 'Tratamientos (Faciales y Corporales)' ? 'selected' : ''}>Tratamientos</option>
                <option value="Cejas y Pestañas" ${Admin.filterType === 'Cejas y Pestañas' ? 'selected' : ''}>Cejas y Pestañas</option>
                <option value="Depilación" ${Admin.filterType === 'Depilación' ? 'selected' : ''}>Depilación</option>
                <option value="Combos del Mes" ${Admin.filterType === 'Combos del Mes' ? 'selected' : ''}>Combos del Mes</option>
            </select>
        `;
        container.appendChild(filterDiv);

        // Cloud Sync Section
        const syncDiv = document.createElement('div');
        syncDiv.style.marginBottom = '1.5rem';
        syncDiv.style.display = 'flex';
        syncDiv.style.gap = '1rem';
        syncDiv.style.flexWrap = 'wrap';
        syncDiv.innerHTML = `
            <button onclick="Admin.syncServicesToCloud()" class="nav-btn" style="background:var(--forest-green); color:#fff; border:none; font-size:0.7rem; padding: 0.6rem 1rem; width: auto;">
                GUARDAR Y SINCRONIZAR EN NUBE
            </button>
            <button onclick="Admin.importServicesFromCloud()" class="nav-btn" style="background:#fff; color:var(--forest-green); border:1.5px solid var(--forest-green); font-size:0.7rem; padding: 0.6rem 1rem; width: auto;">
                IMPORTAR DESDE NUBE
            </button>
        `;
        container.appendChild(syncDiv);

        const filteredServices = Admin.filterType === 'all'
            ? services
            : services.filter(s => s.type === Admin.filterType);

        if (filteredServices.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'text-muted';
            emptyMsg.style.cssText = 'padding: 2rem; border: 1px dashed var(--border-color); border-radius: 12px; text-align: center;';
            emptyMsg.textContent = 'No hay servicios en esta categoría.';
            container.appendChild(emptyMsg);
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 25%;">Categoría</th>
                    <th style="width: 40%;">Servicio</th>
                    <th style="width: 15%;">Duración</th>
                    <th style="width: 10%;">Precio</th>
                    <th style="width: 10%;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${filteredServices.map(s => `
                    <tr>
                        <td style="font-weight: 600;">
                            <span style="color: var(--forest-green); font-size: 0.75rem; text-transform: uppercase;">${s.type}</span><br>
                            <span style="font-size: 0.9rem;">${s.category}</span>
                        </td>
                        <td>
                            <div style="font-weight: 700; color: var(--forest-green); margin-bottom: 4px;">${s.subcategory}</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem; line-height: 1.3; overflow-wrap: break-word; word-wrap: break-word; max-width: 300px;">${s.description || 'Sin descripción'}</div>
                        </td>
                        <td style="font-weight: 600;">${s.duration} min</td>
                        <td style="font-weight: 700; color: var(--forest-green);">$${s.price.toLocaleString()}</td>
                        <td>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: stretch;">
                                <button onclick="Admin.editService('${s.id}')" 
                                    style="background:#fff; color:var(--forest-green); border:1.5px solid var(--forest-green); padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.7rem; text-transform:uppercase; transition:all 0.2s;">
                                    Editar
                                </button>
                                <button onclick="Admin.deleteService('${s.id}')" 
                                    style="background:#fff; color:#c62828; border:1.5px solid #c62828; padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.7rem; text-transform:uppercase; transition:all 0.2s;">
                                    Borrar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    },

    showAddServiceModal: () => {
        document.getElementById('modal-title').textContent = 'Nuevo Servicio';
        document.getElementById('edit-id').value = '';
        document.getElementById('edit-type').value = 'Tratamientos (Faciales y Corporales)';
        document.getElementById('edit-category').value = '';
        document.getElementById('edit-subcategory').value = '';
        document.getElementById('edit-gender').value = 'Unisex';
        document.getElementById('edit-duration').value = '';
        document.getElementById('edit-price').value = '';
        document.getElementById('edit-description').value = '';
        document.getElementById('service-modal').style.display = 'flex';
    },

    editService: (id) => {
        const services = DataManager.getServices();
        const service = services.find(s => s.id === id);
        if (!service) return;

        document.getElementById('modal-title').textContent = 'Editar Servicio';
        document.getElementById('edit-id').value = service.id;
        document.getElementById('edit-type').value = service.type;
        document.getElementById('edit-category').value = service.category;
        document.getElementById('edit-subcategory').value = service.subcategory;
        document.getElementById('edit-gender').value = service.gender;
        document.getElementById('edit-duration').value = service.duration;
        document.getElementById('edit-price').value = service.price;
        document.getElementById('edit-description').value = service.description || '';
        document.getElementById('service-modal').style.display = 'flex';
    },

    saveService: async () => {
        const id = document.getElementById('edit-id').value;
        const type = document.getElementById('edit-type').value;
        const category = document.getElementById('edit-category').value;
        const subcategory = document.getElementById('edit-subcategory').value;
        const gender = document.getElementById('edit-gender').value;
        const duration = parseInt(document.getElementById('edit-duration').value);
        const price = parseInt(document.getElementById('edit-price').value);
        const description = document.getElementById('edit-description').value;

        if (!category || !subcategory || !duration || !price) {
            alert('Por favor complete todos los campos');
            return;
        }

        const services = DataManager.getServices();
        if (id) {
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                services[index] = { id, type, category, subcategory, gender, duration, price, description };
            }
        } else {
            const newId = Date.now().toString();
            services.push({ id: newId, type, category, subcategory, gender, duration, price, description });
        }

        DataManager.saveServices(services);
        document.getElementById('service-modal').style.display = 'none';
        Admin.renderServicesList();

        // Automatic Cloud Sync
        const settings = DataManager.getSettings();
        if (settings.googleScriptUrl) {
            Admin.syncServicesToCloud(false); // Silent sync
        }
    },

    deleteService: async (id) => {
        if (confirm('¿Está seguro de eliminar este servicio?')) {
            const services = DataManager.getServices().filter(s => s.id !== id);
            DataManager.saveServices(services);
            Admin.renderServicesList();

            // Automatic Cloud Sync
            const settings = DataManager.getSettings();
            if (settings.googleScriptUrl) {
                Admin.syncServicesToCloud(false); // Silent sync
            }
        }
    },

    syncServicesToCloud: async (showAlert = true) => {
        const settings = DataManager.getSettings();
        if (!settings.googleScriptUrl) {
            if (showAlert) alert('Configure primero la URL de Google Script en Configuración.');
            return;
        }

        const services = DataManager.getServices();
        const btn = showAlert ? document.querySelector('button[onclick*="syncServicesToCloud"]') : null;
        const originalText = btn ? btn.textContent : '';

        if (btn && showAlert) {
            btn.textContent = 'Sincronizando...';
            btn.disabled = true;
        }

        try {
            await fetch(settings.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'saveServices',
                    services: services
                })
            });
            if (showAlert) alert('Servicios guardados y sincronizados con éxito.');
        } catch (error) {
            console.error('Cloud Sync Error:', error);
            if (showAlert) alert('Error al sincronizar: ' + error.message);
        } finally {
            if (btn && showAlert) {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    },

    syncSettingsToCloud: async (showAlert = true) => {
        const settings = DataManager.getSettings();
        if (!settings.googleScriptUrl) {
            if (showAlert) alert('Configure primero la URL de Google Script en Configuración.');
            return;
        }

        const btn = showAlert ? document.querySelector('button[onclick*="saveSettings"]') : null;
        const originalText = btn ? btn.textContent : '';

        if (btn && showAlert) {
            btn.textContent = 'Sincronizando...';
            btn.disabled = true;
        }

        try {
            await fetch(settings.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'saveSettings',
                    settings: settings
                })
            });
            if (showAlert) console.log('Configuración sincronizada en la nube.');
        } catch (error) {
            console.error('Cloud Sync Settings Error:', error);
            if (showAlert) alert('Error al sincronizar configuración: ' + error.message);
        } finally {
            if (btn && showAlert) {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    },

    importServicesFromCloud: async () => {
        if (!confirm('Esto reemplazará todos los servicios locales con los datos que hay actualmente en Google Sheets. ¿Deseas continuar?')) return;

        const settings = DataManager.getSettings();
        if (!settings.googleScriptUrl) {
            alert('Configure primero la URL de Google Script en Configuración.');
            return;
        }

        try {
            const response = await fetch(`${settings.googleScriptUrl}?action=getServices`);
            const remoteServices = await response.json();
            if (remoteServices && remoteServices.length > 5) { // Safety check
                DataManager.saveServices(remoteServices);
                Admin.renderServicesList();
                alert('Servicios importados con éxito.');
            } else {
                alert('No se encontraron servicios válidos para importar.');
            }
        } catch (error) {
            alert('Error al importar: ' + error.message);
        }
    },

    // Agenda Management
    renderAgenda: () => {
        const bookings = DataManager.getBookings().sort((a, b) => b.date.localeCompare(a.date));
        const container = document.getElementById('admin-agenda-list');
        container.innerHTML = `
            <div style="margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center;">
                <button onclick="Admin.syncAgenda()" class="nav-btn" style="font-size: 0.75rem;">Sincronizar con Google Sheets</button>
            </div>
        `;

        if (bookings.length === 0) {
            container.innerHTML += '<p class="text-muted">No hay turnos registrados.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Fecha/Hora</th>
                    <th>Cliente</th>
                    <th>Servicios</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(b => `
                    <tr>
                        <td>
                            <div style="font-weight: 600;">${b.date}</div>
                            <div style="color: var(--forest-green); font-size: 0.85rem;">${b.time}</div>
                        </td>
                        <td>
                            <div style="font-weight: 600;">${b.client.name}</div>
                            <div style="font-size: 0.8rem;">${b.client.phone}</div>
                        </td>
                        <td>
                            <div style="font-size: 0.85rem; max-width: 250px;">${b.services.join(', ')}</div>
                        </td>
                        <td style="font-weight: 700;">$${(b.price || 0).toLocaleString()}</td>
                        <td>
                            <button onclick="Admin.deleteBooking('${b.id}')" style="color:var(--error); background:none; border:none; cursor:pointer; font-weight:600; font-size:0.75rem;">ELIMINAR</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    },

    deleteBooking: (id) => {
        if (confirm('¿Eliminar esta reserva local? (No se borrará de Google Sheets)')) {
            const bookings = DataManager.getBookings().filter(b => b.id !== id);
            DataManager.saveBookings(bookings);
            Admin.renderAgenda();
        }
    },

    syncAgenda: async () => {
        const settings = DataManager.getSettings();
        if (!settings.googleScriptUrl) {
            alert('Por favor configure la URL de Google Script primero.');
            return;
        }
        const btn = document.querySelector('button[onclick="Admin.syncAgenda()"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sincronizando...';
        btn.disabled = true;

        try {
            const response = await fetch(settings.googleScriptUrl);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Map keys from Google Sheet to our format
            const mappedBookings = data.map(b => ({
                id: b.id_reserva || Date.now().toString() + Math.random(),
                date: b.fecha instanceof Date ? b.fecha.toISOString().split('T')[0] : b.fecha,
                time: b.hora,
                duration: parseInt(b.duración_min) || 60,
                services: (b.servicios || "").split(', ').filter(Boolean),
                client: {
                    name: b.cliente || "Sin Nombre",
                    email: b.email || "",
                    phone: b.teléfono || ""
                },
                price: parseInt(b.precio) || 0,
                status: b.estado || 'confirmed'
            }));

            // Merge with local (avoiding duplicates by date and time)
            const local = DataManager.getBookings();
            const merged = [...local];

            mappedBookings.forEach(remote => {
                const exists = merged.some(l => l.date === remote.date && l.time === remote.time);
                if (!exists) merged.push(remote);
            });

            DataManager.saveBookings(merged);
            Admin.renderAgenda();
            alert('Agenda sincronizada con éxito');
        } catch (error) {
            console.error(error);
            alert('Error al sincronizar: ' + error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    },

    // Blocking Management
    renderBlocking: () => {
        const settings = DataManager.getSettings();
        // Days
        const daysContainer = document.getElementById('blocked-days-list');
        daysContainer.innerHTML = '';
        if (settings.blockedDays.length === 0) {
            daysContainer.innerHTML = '<p class="text-muted">No hay días bloqueados.</p>';
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            settings.blockedDays.sort().forEach(day => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.padding = '0.5rem';
                li.style.borderBottom = '1px solid var(--border-color)';
                li.style.maxWidth = '300px';
                li.innerHTML = `<span>${day}</span><button onclick="Admin.removeBlockedDay('${day}')" style="background:none; border:none; color:var(--error); cursor:pointer;">Eliminar</button>`;
                ul.appendChild(li);
            });
            daysContainer.appendChild(ul);
        }
        // Ranges
        const rangesContainer = document.getElementById('blocked-ranges-list');
        rangesContainer.innerHTML = '';
        if (!settings.blockedRanges || settings.blockedRanges.length === 0) {
            rangesContainer.innerHTML = '<p class="text-muted">No hay horarios bloqueados.</p>';
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            settings.blockedRanges.forEach((range, idx) => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.padding = '0.5rem';
                li.style.borderBottom = '1px solid var(--border-color)';
                li.style.maxWidth = '400px';
                li.innerHTML = `<span>${range.date}: ${range.start} - ${range.end}</span><button onclick="Admin.removeBlockedRange(${idx})" style="background:none; border:none; color:var(--error); cursor:pointer;">Eliminar</button>`;
                ul.appendChild(li);
            });
            rangesContainer.appendChild(ul);
        }
        // Categories
        // Category Availability
        const catContainer = document.getElementById('blocked-categories-list');
        catContainer.innerHTML = '';

        const categories = ['Tratamientos (Faciales y Corporales)', 'Cejas y Pestañas', 'Depilación', 'Combos del Mes'];

        categories.forEach(cat => {
            const mode = settings.categoryModes[cat] || 'open';
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '1.5rem';
            wrapper.style.padding = '1rem';
            wrapper.style.border = '1px solid var(--border-color)';
            wrapper.style.borderRadius = '8px';

            wrapper.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h5 style="margin:0; font-size:0.95rem; color:var(--forest-green);">${cat}</h5>
                    <select onchange="Admin.setCategoryMode('${cat}', this.value)" style="padding:5px; border-radius:4px;">
                        <option value="open" ${mode === 'open' ? 'selected' : ''}>Siempre Abierto</option>
                        <option value="manual" ${mode === 'manual' ? 'selected' : ''}>Fechas Específicas</option>
                    </select>
                </div>
            `;

            if (mode === 'manual') {
                const datesDiv = document.createElement('div');
                const allowed = settings.allowedDates.filter(d => d.category === cat).sort((a, b) => a.date.localeCompare(b.date));

                let datesHtml = '<ul style="list-style:none; padding:0; margin-bottom:1rem;">';
                if (allowed.length === 0) {
                    datesHtml += '<li class="text-muted">No hay fechas habilitadas (Categoría Cerrada)</li>';
                } else {
                    allowed.forEach((item, idx) => {
                        // Find original index to delete correctly
                        const realIdx = settings.allowedDates.findIndex(d => d.category === item.category && d.date === item.date);
                        datesHtml += `
                            <li style="display:flex; justify-content:space-between; padding:0.3rem 0; border-bottom:1px solid var(--border-color);">
                                <span>${item.date}</span>
                                <button onclick="Admin.removeAllowedDate(${realIdx})" style="color:var(--error); background:none; border:none; cursor:pointer;">X</button>
                            </li>
                        `;
                    });
                }
                datesHtml += '</ul>';

                datesHtml += `
                    <div style="display:flex; gap:0.5rem;">
                        <input type="date" id="date-input-${cat}" class="form-control" style="font-size:0.9rem;">
                        <button onclick="Admin.addAllowedDate('${cat}')" class="btn-confirm" style="width:auto; padding:0.5rem 1rem; margin:0;">Agregar</button>
                    </div>
                `;
                datesDiv.innerHTML = datesHtml;
                wrapper.appendChild(datesDiv);
            }

            catContainer.appendChild(wrapper);
        });
    },

    addBlockedDay: () => {
        const date = document.getElementById('block-date-input').value;
        if (!date) return;
        const settings = DataManager.getSettings();
        if (!settings.blockedDays.includes(date)) {
            settings.blockedDays.push(date);
            DataManager.saveSettings(settings);
            Admin.renderBlocking();
            Admin.syncSettingsToCloud(false); // Sync to cloud after blocking
            document.getElementById('block-date-input').value = '';
        } else {
            alert('Este día ya está bloqueado.');
        }
    },

    addBlockedRange: () => {
        const date = document.getElementById('block-range-date').value;
        const start = document.getElementById('block-range-start').value;
        const end = document.getElementById('block-range-end').value;
        if (!date || !start || !end) {
            alert('Por favor complete todos los campos (Fecha, Inicio, Fin).');
            return;
        }
        if (start >= end) {
            alert('La hora de inicio debe ser menor a la hora de fin.');
            return;
        }
        const settings = DataManager.getSettings();
        if (!settings.blockedRanges) settings.blockedRanges = [];
        settings.blockedRanges.push({ date, start, end });
        DataManager.saveSettings(settings);
        Admin.renderBlocking();
        Admin.syncSettingsToCloud(false);
        document.getElementById('block-range-date').value = '';
        document.getElementById('block-range-start').value = '';
        document.getElementById('block-range-end').value = '';
    },

    removeBlockedRange: (index) => {
        if (confirm('¿Eliminar este bloqueo de horario?')) {
            const settings = DataManager.getSettings();
            settings.blockedRanges.splice(index, 1);
            DataManager.saveSettings(settings);
            Admin.renderBlocking();
            Admin.syncSettingsToCloud(false);
        }
    },

    removeBlockedDay: (date) => {
        if (confirm(`¿Desbloquear el día ${date}?`)) {
            const settings = DataManager.getSettings();
            settings.blockedDays = settings.blockedDays.filter(d => d !== date);
            DataManager.saveSettings(settings);
            Admin.renderBlocking();
            Admin.syncSettingsToCloud(false);
        }
    },

    // Category Availability Management
    setCategoryMode: (category, mode) => {
        const settings = DataManager.getSettings();
        settings.categoryModes[category] = mode;
        DataManager.saveSettings(settings);
        Admin.renderBlocking();
        Admin.syncSettingsToCloud(false); // Sync to cloud after mode change
    },

    addAllowedDate: (category) => {
        const input = document.getElementById(`date-input-${category}`);
        const date = input.value;
        if (!date) return;

        const settings = DataManager.getSettings();
        const exists = settings.allowedDates.some(d => d.category === category && d.date === date);

        if (!exists) {
            settings.allowedDates.push({ category, date });
            DataManager.saveSettings(settings);
            Admin.renderBlocking();
            Admin.syncSettingsToCloud(false); // Sync to cloud after changes
        } else {
            alert('Esta fecha ya está habilitada.');
        }
    },

    removeAllowedDate: (index) => {
        if (confirm('¿Deshabilitar esta fecha?')) {
            const settings = DataManager.getSettings();
            settings.allowedDates.splice(index, 1);
            DataManager.saveSettings(settings);
            Admin.renderBlocking();
            Admin.syncSettingsToCloud(false); // Sync to cloud after changes
        }
    },

    // Settings Management
    loadSettings: () => {
        const settings = DataManager.getSettings();
        document.getElementById('config-phone').value = settings.adminPhone;
        document.getElementById('config-message').value = settings.whatsappMessage;
        document.getElementById('config-script-url').value = settings.googleScriptUrl || '';
        document.getElementById('config-mp-link').value = settings.mpLink || '';
        document.getElementById('config-bank-name').value = settings.bankName || '';
        document.getElementById('config-bank-alias').value = settings.bankAlias || '';
        document.getElementById('config-bank-cbu').value = settings.bankCbu || '';
        document.getElementById('config-bank-holder').value = settings.bankHolder || '';
        document.getElementById('config-deposit-message').value = settings.depositMessage || '';
        document.getElementById('config-policies').value = settings.policiesText || '';
    },

    saveSettings: () => {
        const settings = DataManager.getSettings();
        settings.adminPhone = document.getElementById('config-phone').value;
        settings.whatsappMessage = document.getElementById('config-message').value;
        settings.googleScriptUrl = document.getElementById('config-script-url').value;
        settings.mpLink = document.getElementById('config-mp-link').value;
        settings.bankName = document.getElementById('config-bank-name').value;
        settings.bankAlias = document.getElementById('config-bank-alias').value;
        settings.bankCbu = document.getElementById('config-bank-cbu').value;
        settings.bankHolder = document.getElementById('config-bank-holder').value;
        settings.depositMessage = document.getElementById('config-deposit-message').value;
        settings.policiesText = document.getElementById('config-policies').value;
        DataManager.saveSettings(settings);
        Admin.syncSettingsToCloud(true); // Sync with alert
        alert('Configuración guardada correctamente');
    },

    testConnection: async () => {
        const url = document.getElementById('config-script-url').value;
        if (!url) {
            alert('Ingrese una URL primero');
            return;
        }

        try {
            const response = await fetch(url + '?action=getServices');
            if (response.ok) {
                alert('¡Conexión exitosa! Google Sheets está respondiendo.');
            } else {
                alert('Error de conexión: ' + response.statusText);
            }
        } catch (error) {
            alert('Error de conexión: Asegúrese de que la URL sea correcta y tenga permisos de acceso público.');
        }
    },

    changePassword: () => {
        const newPass = document.getElementById('new-admin-pass').value;
        if (!newPass) {
            alert('Ingrese una nueva contraseña');
            return;
        }
        const admin = DataManager.getAdmin();
        admin.password = newPass;
        DataManager.saveAdmin(admin);
        document.getElementById('new-admin-pass').value = '';
        alert('Contraseña actualizada con éxito');
    }
};
