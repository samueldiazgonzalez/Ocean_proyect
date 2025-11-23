// admin-logic.js - Versión Corregida con Perfil, Logout y Soporte

// === DATOS DE PRUEBA ===
const dashboardMetrics = { totalUsers: 8450, activeServices: 1250, pendingServicesApproval: 15, activeSuppliers: 187, averagePlatformRating: 4.3, lowRatingAlerts: 7 };
const dummySupplierData = [
    { id: 'P001', name: 'Hotel Sol y Playa S.A.', servicesCount: 5, rating: 4.5, status: 'Active', pendingServices: 0 },
    { id: 'P002', name: 'Tours Aventura SAS', servicesCount: 12, rating: 3.9, status: 'Suspended', pendingServices: 3 },
];
const dummyServicesDirectory = [
    { id: 'S101', name: 'Tour Buceo Isla Sol', supplier: 'Tours Aventura SAS', category: 'Aventura', status: 'Approved', rating: 4.5 },
    { id: 'S102', name: 'Hotel Sol y Playa - Habitación', supplier: 'Hotel Sol y Playa S.A.', category: 'Alojamiento', status: 'Pending', rating: 0 },
];
const dummyReviewData = [
    { id: 'RV101', supplier: 'P001', service: 'Habitación Doble', rating: 1, comment: 'Pésimo servicio, reservé doble y me dieron sencilla.', date: '2025-11-18' },
];

// === REFERENCIAS DEL DOM AGRUPADAS ===
const DOM = {
    mainContent: document.getElementById('main-content-area'),
    navLinks: document.querySelectorAll('.sidebar-menu a.nav-link'),
    viewTitle: document.getElementById('view-title'), 
    detailModal: document.getElementById('detail-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    // Agregamos el botón de logout que estaba en el HTML
    logoutBtnSidebar: document.getElementById('logout-btn-sidebar') 
};

// --- CONTROL DE SESIÓN Y VISTAS ---

function handleLogout(e) {
    e.preventDefault();
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
        alert('Sesión cerrada. Reiniciando la aplicación.');
        window.location.hash = '';
        window.location.reload(); 
    }
}

function setActiveLink(clickedLink) {
    DOM.navLinks.forEach(l => l.classList.remove('active'));
    clickedLink.classList.add('active');
    DOM.viewTitle.textContent = clickedLink.textContent.trim().split('(')[0]; 
}

function loadView(viewName) {
    const viewFunc = views[viewName];
    DOM.mainContent.innerHTML = viewFunc ? viewFunc() : '<div class="card"><h2>404 - Vista no encontrada</h2></div>';
    window.history.pushState({}, viewName, `#${viewName}`);
    
    const activeLink = document.querySelector(`[data-view="${viewName}"]`);
    if (activeLink) setActiveLink(activeLink);

    // Si la vista cargada es 'help', añadimos el listener del formulario
    if (viewName === 'help') {
        const helpForm = document.getElementById('help-form');
        if (helpForm) helpForm.addEventListener('submit', handleHelpSubmit);
    }
}

function handleHelpSubmit(e) {
    e.preventDefault();
    const subject = document.getElementById('help-subject').value;
    const message = document.getElementById('help-message').value;

    if (!subject.trim() || !message.trim()) {
        alert('Por favor, completa el Asunto y el Mensaje.');
        return;
    }
    
    // Simulación de envío
    console.log('--- Nueva solicitud de soporte ---');
    console.log(`Asunto: ${subject}`);
    console.log(`Mensaje: ${message}`);
    
    alert(`✅ Solicitud enviada con éxito. Asunto: "${subject}".`);

    e.target.reset();
}


// --- FUNCIONES DE RENDERIZADO ---

function renderSupplierTableBody(data) { 
    return data.map(supplier => {
        const statusClass = supplier.status === 'Active' ? 'status-completed' : 'status-danger';
        const pendingBadge = supplier.pendingServices > 0 ? `<span class="status status-pending" style="margin-left: 10px;">${supplier.pendingServices} Pend.</span>` : '';
        const ratingColor = supplier.rating < 4 ? '#dc3545' : '#28a745';
        return `
            <tr>
                <td>${supplier.id}</td><td>${supplier.name}</td><td>${supplier.servicesCount} ${pendingBadge}</td>
                <td style="color: ${ratingColor}; font-weight: 600;">${supplier.rating} ⭐</td>
                <td><span class="status ${statusClass}">${supplier.status === 'Active' ? 'Activo' : 'Suspendido'}</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${supplier.id}" data-type="supplier">Auditar</button></td>
            </tr>
        `;
    }).join('');
}
function renderServicesTableBody(data) {
    return data.map(service => {
        const statusClass = service.status === 'Approved' ? 'status-completed' : 'status-pending';
        const ratingDisplay = service.rating > 0 ? `${service.rating} ⭐` : 'N/A';
        return `
            <tr>
                <td>${service.id}</td><td>${service.name}</td><td>${service.supplier}</td><td>${service.category}</td>
                <td>${ratingDisplay}</td><td><span class="status ${statusClass}">${service.status === 'Approved' ? 'Aprobado' : 'Pendiente'}</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${service.id}" data-type="service">Auditar</button></td>
            </tr>
        `;
    }).join('');
}
function renderReviewsTableBody(data) {
    return data.map(review => {
        const statusClass = review.rating <= 2 ? 'status-danger' : 'status-completed';
        return `
            <tr>
                <td>${review.id}</td><td>${review.supplier}</td><td>${review.service}</td>
                <td>${review.rating} ⭐</td><td>${review.comment.substring(0, 50)}...</td>
                <td><span class="status ${statusClass}">Monitoreada</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${review.id}" data-type="review">Leer</button></td>
            </tr>
        `;
    }).join('');
}

// Definición de las vistas (Añadida la vista 'help')
const views = {
    dashboard: () => `
        <h2 style="margin-bottom: 25px;">Monitoreo de Calidad y Operaciones</h2>
        <section class="stats">
            <div class="stat-card"><i class="ri-star-line"></i><h2>${dashboardMetrics.averagePlatformRating}</h2><p>Calificación Promedio</p></div>
            <div class="stat-card" style="background: #fff9e6;"><i class="ri-file-search-line" style="color: #ffc107;"></i><h2 style="color: #ffc107;">${dashboardMetrics.pendingServicesApproval}</h2><p>Servicios por **Aprobar**</p></div>
            <div class="stat-card" style="background: #fcebeb;"><i class="ri-alert-line" style="color: #dc3545;"></i><h2 style="color: #dc3545;">${dashboardMetrics.lowRatingAlerts}</h2><p>Alertas de Reseñas Bajas</p></div>
            <div class="stat-card"><i class="ri-group-line"></i><h2>${dashboardMetrics.totalUsers}</h2><p>Usuarios Registrados</p></div>
        </section>
        <div class="card" style="margin-top: 30px;"><h3 style="color: #004a8f;"><i class="ri-pie-chart-line"></i> Tendencias Operacionales</h3><p style="color: #555;">Gráficos clave de monitoreo (Placeholder).</p></div>
    `,
    suppliers: () => `
        <h2>🤝 Monitoreo de Proveedores</h2><div class="card" style="padding: 20px;"><div class="action-bar"><button class="btn-primary" id="low-rating-filter-btn">Ver Proveedores con Rating Bajo (< 4.0)</button></div>
        <table><thead><tr><th>ID</th><th>Nombre Fiscal</th><th># Servicios</th><th>Rating Prom.</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="supplier-list">${renderSupplierTableBody(dummySupplierData)}</tbody></table></div>`,
    services_directory: () => `
        <h2>🌍 Directorio de Servicios Turísticos</h2><div class="card" style="padding: 20px;"><p>Monitoreo y gestión del catálogo de servicios publicados.</p><form id="service-filter-form" class="filter-form">
        <input type="text" id="filter-service-name" placeholder="Nombre/ID del Servicio" class="input-field"><select id="filter-status" class="input-field"><option value="">Todos los Estados</option><option value="Approved">Aprobados</option><option value="Pending">Pendientes de Aprobación</option></select><button type="submit" class="btn-primary">🔍 Aplicar Filtros</button></form>
        <table><thead><tr><th>ID</th><th>Nombre</th><th>Proveedor</th><th>Categoría</th><th>Rating Prom.</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="services-tbody">${renderServicesTableBody(dummyServicesDirectory)}</tbody></table></div>`,
    reviews: () => `
        <h2>⭐ Gestión de Reseñas</h2><div class="card" style="padding: 20px;"><p>Monitoreo de feedback para la gestión de calidad.</p>
        <table><thead><tr><th>ID Reseña</th><th>Proveedor</th><th>Servicio</th><th>Rating</th><th>Comentario</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="reviews-tbody">${renderReviewsTableBody(dummyReviewData)}</tbody></table></div>`,
    users: () => `
        <h2>👥 Listado de Usuarios Registrados</h2><div class="card"><p>Aquí se cargaría la lista de usuarios para gestión de acceso y registro.</p>
        <table><thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Registrado</th><th>Acciones</th></tr></thead><tbody><tr><td>U1001</td><td>Ana C. Pérez</td><td>ana.perez@mail.com</td><td>2024-01-15</td><td><button class="btn-secondary btn">Bloquear</button></td></tr>
        <tr><td>U1002</td><td>Roberto G.</td><td>robertog@mail.com</td><td>2024-10-20</td><td><button class="btn-secondary btn">Bloquear</button></td></tr></tbody></table></div>`,
    help: () => `
        <h2>❓ Centro de Ayuda y Soporte</h2>
        <div class="card" style="max-width: 600px; margin: 30px auto;">
            <p style="margin-bottom: 20px;">Si tienes dudas o encuentras un problema, por favor, rellena el formulario. Tu consulta será enviada al equipo de administración.</p>
            <form id="help-form" class="help-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;" for="help-subject">Asunto:</label>
                    <input type="text" id="help-subject" class="input-field" placeholder="Ej: Problema al cargar datos de proveedores" required style="width: 100%;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;" for="help-message">Mensaje / Detalle del Problema:</label>
                    <textarea id="help-message" class="input-field" rows="6" placeholder="Describe el problema o la duda con el mayor detalle posible." required style="width: 100%; resize: vertical;"></textarea>
                </div>
                <button type="submit" class="btn-primary">Enviar Solicitud de Ayuda</button>
            </form>
        </div>
    `
};

// --- INICIALIZACIÓN Y LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Listeners de la Barra Lateral (Navegación)
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const viewName = link.getAttribute('data-view');
            if (viewName) loadView(viewName);
        });
    });
    
    // 2. Listener del botón Cerrar Sesión
    if (DOM.logoutBtnSidebar) {
        DOM.logoutBtnSidebar.addEventListener('click', handleLogout);
    }

    // 3. Delegación de Eventos (Botones de Auditoría)
    DOM.mainContent.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('view-btn')) {
            const id = target.getAttribute('data-id');
            const type = target.getAttribute('data-type');
            
            // Lógica del Modal
            DOM.detailModal.querySelector('#modal-title').textContent = `Auditoría - Detalle de ${type.toUpperCase()} #${id}`;
            DOM.detailModal.querySelector('#modal-body-content').innerHTML = `<p><strong>ID:</strong> ${id}</p><p>Detalle para auditoría de ${type}.</p>`;
            DOM.detailModal.style.display = 'block';
        }
    });
    
    // 4. Listeners del Modal
    if (DOM.closeModalBtn) DOM.closeModalBtn.onclick = () => { DOM.detailModal.style.display = 'none'; };
    window.onclick = (event) => { 
        if (event.target === DOM.detailModal) DOM.detailModal.style.display = 'none'; 
    };

    // 5. Carga de Vista Inicial
    const initialView = window.location.hash.substring(1) || 'dashboard';
    loadView(initialView);
});