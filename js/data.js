const DEFAULT_SERVICES = [
    // --- TRATAMIENTOS FACIALES ---
    { id: 'tf1', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Limpieza profunda', gender: 'Unisex', duration: 60, price: 30000, description: 'Limpieza profunda que elimina impurezas y células muertas. Devuelve luminosidad y suavidad a tu piel.' },
    { id: 'tf2', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Peeling', gender: 'Unisex', duration: 60, price: 35000, description: 'Renovación celular que reduce manchas y arrugas. Logra una textura uniforme y tono radiante.' },
    { id: 'tf3', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Dermapen con exosomas', gender: 'Unisex', duration: 60, price: 40000, description: 'Microneedling con exosomas para estimular colágeno. Mejora firmeza, hidratación y apariencia general cutánea.' },
    { id: 'tf4-1', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Radiofrecuencia fraccionada (Zona 1 - Rostro)', gender: 'Unisex', duration: 60, price: 80000, description: 'Tecnología de tensado cutáneo. Reduce flacidez y arrugas. Resultados visibles en firmeza y textura.' },
    { id: 'tf4-2', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Radiofrecuencia fraccionada (Zona 2 - Rostro y Cuello)', gender: 'Unisex', duration: 60, price: 100000, description: 'Tensado cutáneo en rostro y cuello. Reduce flacidez profunda y estimula la regeneración de colágeno.' },

    // --- TRATAMIENTOS CORPORALES ---
    // Criolipolisis
    { id: 'tc1', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Criolipolisis (1 Zona)', gender: 'Unisex', duration: 45, price: 40000, description: 'Frío controlado que elimina grasa localizada definitivamente. Resultados visibles sin cirugías ni recuperación.' },
    { id: 'tc2', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Criolipolisis (2 Zonas)', gender: 'Unisex', duration: 60, price: 60000, description: 'Frío controlado que elimina grasa localizada definitivamente. Resultados visibles sin cirugías ni recuperación.' },
    { id: 'tc3', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Criolipolisis (3 Zonas)', gender: 'Unisex', duration: 75, price: 80000, description: 'Frío controlado que elimina grasa localizada definitivamente. Resultados visibles sin cirugías ni recuperación.' },
    // Ultracavitador
    { id: 'tc4', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Ultracavitador (1 Zona)', gender: 'Unisex', duration: 45, price: 20000, description: 'Liposucción sin cirugía mediante ultrasonidos. Rompe grasa facilitando su eliminación. Ideal para celulitis.' },
    { id: 'tc5', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Ultracavitador (2 Zonas)', gender: 'Unisex', duration: 60, price: 25000, description: 'Liposucción sin cirugía mediante ultrasonidos. Rompe grasa facilitando su eliminación. Ideal para celulitis.' },
    { id: 'tc6', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Ultracavitador (3 Zonas)', gender: 'Unisex', duration: 75, price: 30000, description: 'Liposucción sin cirugía mediante ultrasonidos. Rompe grasa facilitando su eliminación. Ideal para celulitis.' },
    // Vela velvet max
    { id: 'tc7', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Vela velvet max (1 Zona)', gender: 'Unisex', duration: 45, price: 80000, description: 'Combina radiofrecuencia y succión contra celulitis y flacidez. Piel lisa y firme desde la primera sesión.' },
    { id: 'tc8', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Vela velvet max (2 Zonas)', gender: 'Unisex', duration: 60, price: 100000, description: 'Combina radiofrecuencia y succión contra celulitis y flacidez. Piel lisa y firme desde la primera sesión.' },
    { id: 'tc9', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Vela velvet max (3 Zonas)', gender: 'Unisex', duration: 75, price: 120000, description: 'Combina radiofrecuencia y succión contra celulitis y flacidez. Piel lisa y firme desde la primera sesión.' },
    // Radiofrecuencia Fraccionada Corporales (Mismos precios que Vela)
    { id: 'tc-rf1', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Radiofrecuencia Fraccionada (1 Zona)', gender: 'Unisex', duration: 45, price: 80000, description: 'Tensado cutáneo profundo. Estimula colágeno para combatir flacidez y mejorar la textura de la piel.' },
    { id: 'tc-rf2', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Radiofrecuencia Fraccionada (2 Zonas)', gender: 'Unisex', duration: 60, price: 100000, description: 'Tensado cutáneo profundo. Estimula colágeno para combatir flacidez y mejorar la textura de la piel.' },
    { id: 'tc-rf3', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Radiofrecuencia Fraccionada (3 Zonas)', gender: 'Unisex', duration: 75, price: 120000, description: 'Tensado cutáneo profundo. Estimula colágeno para combatir flacidez y mejorar la textura de la piel.' },
    // Electrodos
    { id: 'tc10', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Electrodos (1 Zona)', gender: 'Unisex', duration: 45, price: 15000, description: 'Estimulación muscular que tonifica y mejora la circulación linfática. Complemento ideal para tratamientos reductores.' },
    { id: 'tc11', type: 'Tratamientos (Faciales y Corporales)', category: 'Corporal', subcategory: 'Electrodos (2 Zonas)', gender: 'Unisex', duration: 60, price: 20000, description: 'Estimulación muscular que tonifica y mejora la circulación linfática. Complemento ideal para tratamientos reductores.' },
    // Fototerapia
    { id: 'tf5', type: 'Tratamientos (Faciales y Corporales)', category: 'Facial', subcategory: 'Fototerapia LED', gender: 'Unisex', duration: 45, price: 12000, description: 'Luz LED que estimula colágeno y combate bacterias. Complemento ideal para potenciar cualquier tratamiento facial.' },

    // --- CEJAS Y PESTAÑAS ---
    { id: 'cp1', type: 'Cejas y Pestañas', category: 'Cejas y Pestañas', subcategory: 'Perfilado de Cejas', gender: 'Unisex', duration: 30, price: 8000, description: 'Diseño personalizado de cejas según tus facciones. Enmarca tu mirada resaltando tu belleza natural.' },
    { id: 'cp2', type: 'Cejas y Pestañas', category: 'Cejas y Pestañas', subcategory: 'Brow Lamination', gender: 'Unisex', duration: 60, price: 15000, description: 'Lifting de cejas para efecto tupido y definido. Incluye nutrición para mantener el vello sano.' },
    { id: 'cp3', type: 'Cejas y Pestañas', category: 'Cejas y Pestañas', subcategory: 'Lash Lifting', gender: 'Unisex', duration: 60, price: 18000, description: 'Eleva y curva tus pestañas naturales desde la raíz. Aporta longitud y espesor sin extensiones.' },
    { id: 'cp4', type: 'Cejas y Pestañas', category: 'Cejas y Pestañas', subcategory: 'Service de Pestañas', gender: 'Unisex', duration: 45, price: 12000, description: 'Mantenimiento y nutrición profesional para conservar un arqueado perfecto y saludable diariamente.' },

    // --- DEPILACIÓN FEMENINA ---
    { id: 'df1', type: 'Depilación', category: 'Femenina', subcategory: 'Bozo/Mentón/Mejillas/Patillas', gender: 'Femenino', duration: 15, price: 8000 },
    { id: 'df2', type: 'Depilación', category: 'Femenina', subcategory: 'Rostro', gender: 'Femenino', duration: 20, price: 10000 },
    { id: 'df3', type: 'Depilación', category: 'Femenina', subcategory: 'Axilas', gender: 'Femenino', duration: 15, price: 8000 },
    { id: 'df4', type: 'Depilación', category: 'Femenina', subcategory: 'Brazos', gender: 'Femenino', duration: 30, price: 12000 },
    { id: 'df5', type: 'Depilación', category: 'Femenina', subcategory: 'Abdomen/Pecho', gender: 'Femenino', duration: 20, price: 9000 },
    { id: 'df6', type: 'Depilación', category: 'Femenina', subcategory: 'Espalda media', gender: 'Femenino', duration: 20, price: 9000 },
    { id: 'df7', type: 'Depilación', category: 'Femenina', subcategory: 'Espalda completa', gender: 'Femenino', duration: 30, price: 11000 },
    { id: 'df8', type: 'Depilación', category: 'Femenina', subcategory: 'Cavado simple', gender: 'Femenino', duration: 20, price: 9000 },
    { id: 'df9', type: 'Depilación', category: 'Femenina', subcategory: 'Cavado profundo', gender: 'Femenino', duration: 30, price: 10000 },
    { id: 'df10', type: 'Depilación', category: 'Femenina', subcategory: 'Cavado profundo + Tiro de cola', gender: 'Femenino', duration: 35, price: 11000 },
    { id: 'df11', type: 'Depilación', category: 'Femenina', subcategory: 'Glúteos', gender: 'Femenino', duration: 20, price: 10000 },
    { id: 'df12', type: 'Depilación', category: 'Femenina', subcategory: 'Media pierna', gender: 'Femenino', duration: 30, price: 10000 },
    { id: 'df13', type: 'Depilación', category: 'Femenina', subcategory: 'Pierna completa', gender: 'Femenino', duration: 45, price: 12000 },
    { id: 'df14', type: 'Depilación', category: 'Femenina', subcategory: 'Hombros', gender: 'Femenino', duration: 20, price: 8000 },
    { id: 'df15', type: 'Depilación', category: 'Femenina', subcategory: 'Cuerpo femenino completo', gender: 'Femenino', duration: 90, price: 35000 },

    // --- DEPILACIÓN MASCULINA ---
    { id: 'dm1', type: 'Depilación', category: 'Masculina', subcategory: 'Bozo/Mentón/Mejillas/Patillas', gender: 'Masculino', duration: 15, price: 10000 },
    { id: 'dm2', type: 'Depilación', category: 'Masculina', subcategory: 'Rostro', gender: 'Masculino', duration: 20, price: 12000 },
    { id: 'dm3', type: 'Depilación', category: 'Masculina', subcategory: 'Axilas', gender: 'Masculino', duration: 15, price: 10000 },
    { id: 'dm4', type: 'Depilación', category: 'Masculina', subcategory: 'Brazos', gender: 'Masculino', duration: 30, price: 14000 },
    { id: 'dm5', type: 'Depilación', category: 'Masculina', subcategory: 'Abdomen/Pecho', gender: 'Masculino', duration: 30, price: 11000 },
    { id: 'dm6', type: 'Depilación', category: 'Masculina', subcategory: 'Espalda media', gender: 'Masculino', duration: 30, price: 11000 },
    { id: 'dm7', type: 'Depilación', category: 'Masculina', subcategory: 'Espalda completa', gender: 'Masculino', duration: 40, price: 13000 },
    { id: 'dm8', type: 'Depilación', category: 'Masculina', subcategory: 'Media pierna', gender: 'Masculino', duration: 30, price: 12000 },
    { id: 'dm9', type: 'Depilación', category: 'Masculina', subcategory: 'Pierna completa', gender: 'Masculino', duration: 45, price: 14000 },
    { id: 'dm10', type: 'Depilación', category: 'Masculina', subcategory: 'Hombros', gender: 'Masculino', duration: 20, price: 10000 },
    { id: 'dm11', type: 'Depilación', category: 'Masculina', subcategory: 'Cuerpo masculino completo', gender: 'Masculino', duration: 90, price: 40000 },

    // --- COMBOS FEMENINOS ---
    { id: 'cf1', type: 'Depilación', category: 'Combos Femeninos', subcategory: 'Axilas + Cavado c/ tiro de cola', gender: 'Femenino', duration: 45, price: 15000 },
    { id: 'cf2', type: 'Depilación', category: 'Combos Femeninos', subcategory: 'Axilas + Cavado + Media pierna', gender: 'Femenino', duration: 60, price: 17000 },
    { id: 'cf3', type: 'Depilación', category: 'Combos Femeninos', subcategory: 'Axilas + Cavado + Pierna completa', gender: 'Femenino', duration: 75, price: 19500 },

    // --- COMBOS MASCULINOS ---
    { id: 'cm1', type: 'Depilación', category: 'Combos Masculinos', subcategory: 'Pecho + Media pierna', gender: 'Masculino', duration: 45, price: 18000 },
    { id: 'cm2', type: 'Depilación', category: 'Combos Masculinos', subcategory: 'Espalda + Pierna completa', gender: 'Masculino', duration: 60, price: 20000 },
    { id: 'cm3', type: 'Depilación', category: 'Combos Masculinos', subcategory: 'Pecho + Espalda + Pierna completa', gender: 'Masculino', duration: 90, price: 25000 },

    // --- COMBOS DEL MES ---
    { id: 'com1', type: 'Combos del Mes', category: 'Combos del Mes', subcategory: 'Combo Radiante', gender: 'Unisex', duration: 90, price: 55000, description: 'Limpieza profunda, Peeling y Fototerapia LED. El combo perfecto para renovar tu rostro por completo.' }
];

const DEFAULT_ADMIN = {
    username: 'PLEstetica',
    password: 'admin123'
};
const DEFAULT_SETTINGS = {
    adminPhone: '5491100000000',
    whatsappMessage: 'Hola, quisiera confirmar mi turno para {servicios} el día {fecha} a las {hora}. Total: {total}',
    googleScriptUrl: '',
    blockedDays: [],
    blockedRanges: [], // Array of { date, start, end }
    blockedCategories: [], // Array of { date, category }
    categoryModes: {}, // { 'CategoryName': 'open' | 'manual' }
    allowedDates: [], // Array of { category, date }
    mpLink: '',
    bankName: '',
    bankAlias: '',
    bankCbu: '',
    bankHolder: '',
    depositMessage: 'Para confirmar tu turno es necesario abonar una seña. El monto se descontará del total del servicio.',
    policiesText: `POLÍTICAS DE RESERVA

1. SEÑA: Para confirmar el turno se debe abonar una seña del 50% del valor del servicio.
2. CANCELACIONES: Las cancelaciones deben realizarse con al menos 24hs de anticipación para conservar la seña.
3. TOLERANCIA: Se tendrá una tolerancia de 15 minutos. Pasado ese tiempo, el turno se considerará cancelado y se perderá la seña.
4. REEMBOLSOS: Las señas no son reembolsables en caso de inasistencia sin aviso previo.`
};

const DATA_VERSION = '2026-01-22-v1';

// Data Manager
const DataManager = {
    getServices: () => {
        const storedVersion = localStorage.getItem('pl_data_version');
        const storedServices = localStorage.getItem('pl_services');

        if (storedVersion !== DATA_VERSION || !storedServices) {
            // Update data if version mismatch or no data
            localStorage.setItem('pl_services', JSON.stringify(DEFAULT_SERVICES));
            localStorage.setItem('pl_data_version', DATA_VERSION);
            return DEFAULT_SERVICES;
        }

        return JSON.parse(storedServices);
    },
    saveServices: (services) => {
        localStorage.setItem('pl_services', JSON.stringify(services));
    },
    getAdmin: () => {
        const stored = localStorage.getItem('pl_admin');
        return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
    },
    saveAdmin: (admin) => {
        localStorage.setItem('pl_admin', JSON.stringify(admin));
    },
    getSettings: () => {
        const stored = localStorage.getItem('pl_settings');
        let settings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        // Ensure new fields exist for backward compatibility
        if (!settings.blockedDays) settings.blockedDays = [];
        if (!settings.blockedRanges) settings.blockedRanges = [];
        if (!settings.blockedCategories) settings.blockedCategories = [];
        if (!settings.categoryModes) settings.categoryModes = {};
        if (!settings.allowedDates) settings.allowedDates = [];
        return settings;
    },
    saveSettings: (settings) => {
        localStorage.setItem('pl_settings', JSON.stringify(settings));
    },
    getBookings: () => {
        const stored = localStorage.getItem('pl_bookings');
        let bookings = stored ? JSON.parse(stored) : [];

        // Cleanup: If any current booking has a large base64 receipt, remove it locally
        // to free up quota. The receipts are already in Google Sheets.
        let needsCleanup = false;
        bookings = bookings.map(b => {
            if (b.receipt && b.receipt.length > 1000) {
                delete b.receipt;
                needsCleanup = true;
            }
            return b;
        });

        if (needsCleanup) {
            localStorage.setItem('pl_bookings', JSON.stringify(bookings));
        }

        return bookings;
    },
    saveBookings: (bookings) => {
        localStorage.setItem('pl_bookings', JSON.stringify(bookings));
    },
    getLeads: () => {
        const stored = localStorage.getItem('pl_leads');
        return stored ? JSON.parse(stored) : [];
    },
    saveLeads: (leads) => {
        localStorage.setItem('pl_leads', JSON.stringify(leads));
    },
    resetData: () => {
        localStorage.clear();
        location.reload();
    }
};
