// admin-logic.js

const dummySupplierData = [];
const dummyServicesDirectory = [];
const dummyUserData = [];
const dummyReviewData = [];
const dummySupportTickets = [];

function calculateMetrics() {
    const activeSuppliers = dummySupplierData.length > 0 
        ? dummySupplierData.filter(s => s.status === 'Active').length 
        : 0;
    
    const totalRating = dummySupplierData.length > 0 
        ? dummySupplierData.reduce((sum, s) => sum + s.rating, 0) 
        : 0;
    
    const avgSupplierRating = dummySupplierData.length > 0 
        ? (totalRating / dummySupplierData.length).toFixed(1) 
        : 0;
    
    const lowRatingSuppliersCount = dummySupplierData.length > 0 
        ? dummySupplierData.filter(s => s.rating < 4.0).length 
        : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = dummyUserData.length > 0 
        ? dummyUserData.filter(u => new Date(u.registeredDate) >= thirtyDaysAgo).length 
        : 0;
    
    const oldUsers = dummyUserData.length > 0 
        ? dummyUserData.filter(u => new Date(u.registeredDate) < thirtyDaysAgo).length 
        : 0;
    
    const totalSupportTickets = dummySupportTickets.length;
    const openTickets = dummySupportTickets.length > 0
        ? dummySupportTickets.filter(t => t.status === 'Abierto' || t.status === 'En Proceso').length
        : 0;
    const closedTickets = dummySupportTickets.length > 0
        ? dummySupportTickets.filter(t => t.status === 'Cerrado').length
        : 0;
    
    return {
        totalUsers: dummyUserData.length,
        activeServices: dummyServicesDirectory.filter(s => s.status === 'Approved').length,
        activeSuppliers: activeSuppliers,
        avgSupplierRating: parseFloat(avgSupplierRating),
        lowRatingSuppliersCount: lowRatingSuppliersCount,
        newUsers: newUsers,
        oldUsers: oldUsers,
        totalServicesRegistered: dummyServicesDirectory.length,
        totalSupportTickets: totalSupportTickets,
        openTickets: openTickets,
        closedTickets: closedTickets
    };
}

const dashboardMetrics = calculateMetrics();

const DOM = {
    mainContent: null,
    navLinks: null,
    viewTitle: null, 
    detailModal: null,
    closeModalBtn: null,
    logoutBtnSidebar: null,
    supplierListBody: null, 
};

function initDOMReferences() {
    DOM.mainContent = document.getElementById('main-content-area');
    DOM.navLinks = document.querySelectorAll('.sidebar-menu a.nav-link');
    DOM.viewTitle = document.getElementById('view-title');
    DOM.detailModal = document.getElementById('detail-modal');
    DOM.closeModalBtn = document.getElementById('close-modal-btn');
    DOM.logoutBtnSidebar = document.getElementById('logout-btn-sidebar');
}

function handleLogout(e) {
    e.preventDefault();
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        sessionStorage.clear();
        
        alert('✅ Sesión cerrada exitosamente.');
        
        window.location.href = 'index.html';
    }
}

function setActiveLink(clickedLink) {
    DOM.navLinks.forEach(l => l.classList.remove('active'));
    clickedLink.classList.add('active');
    if (DOM.viewTitle) {
        DOM.viewTitle.textContent = clickedLink.textContent.trim().split('(')[0]; 
    }
}

function loadSupplierView(data, isFiltered) {
    if (DOM.supplierListBody) {
        DOM.supplierListBody.innerHTML = renderSupplierTableBody(data);
    }
    const titleElement = document.querySelector('.suppliers-subtitle');
    if (titleElement) {
        titleElement.textContent = isFiltered 
            ? `Lista de Proveedores (Filtrados por Rating < 4.0 - ${data.length} resultados)` 
            : `Lista Completa de Proveedores (${data.length} resultados)`;
    }
}

function loadView(viewName) {
    const viewFunc = views[viewName];
    
    if (DOM.mainContent) {
        DOM.mainContent.innerHTML = viewFunc ? viewFunc() : '<div class="card"><h2>404 - Vista no encontrada</h2></div>';
    }
    
    window.history.pushState({}, viewName, `#${viewName}`);
    
    const activeLink = document.querySelector(`[data-view="${viewName}"]`);
    if (activeLink) setActiveLink(activeLink);

    if (viewName === 'suppliers') {
        DOM.supplierListBody = document.getElementById('supplier-list'); 

        const filterBtn = document.getElementById('low-rating-filter-btn');
        if (filterBtn) {
            let isFiltered = false;
            filterBtn.addEventListener('click', () => {
                if (isFiltered) {
                    loadSupplierView(dummySupplierData, false);
                    isFiltered = false;
                    filterBtn.textContent = 'Ver Proveedores con Rating Bajo (< 4.0)';
                } else {
                    const filteredData = dummySupplierData.filter(s => s.rating < 4.0);
                    loadSupplierView(filteredData, true);
                    isFiltered = true;
                    filterBtn.textContent = 'Mostrar Todos los Proveedores';
                }
            });
        }
    }

    if (viewName === 'services_directory') {
        const serviceFilterForm = document.getElementById('service-filter-form');
        if (serviceFilterForm) {
            serviceFilterForm.addEventListener('submit', handleServiceFilter);
        }
    }
    
    if (viewName === 'help_center') {
        const helpForm = document.getElementById('help-form');
        if (helpForm) {
            helpForm.addEventListener('submit', handleHelpSubmit);
        }
    }
}

function handleServiceFilter(e) {
    e.preventDefault();
    const nameFilter = document.getElementById('filter-service-name').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    
    let filteredServices = dummyServicesDirectory;
    
    if (nameFilter) {
        filteredServices = filteredServices.filter(s => 
            s.name.toLowerCase().includes(nameFilter) || s.id.toLowerCase().includes(nameFilter)
        );
    }
    
    if (statusFilter) {
        filteredServices = filteredServices.filter(s => s.status === statusFilter);
    }
    
    const tbody = document.getElementById('services-tbody');
    if (tbody) {
        tbody.innerHTML = renderServicesTableBody(filteredServices);
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
    
    console.log('--- Nueva solicitud de soporte ---');
    console.log(`Asunto: ${subject}`);
    console.log(`Mensaje: ${message}`);
    
    alert(`✅ Solicitud enviada con éxito. Asunto: "${subject}".`);

    e.target.reset();
}

function renderSupplierTableBody(data) { 
    if (!data || data.length === 0) {
        return '<tr><td colspan="6" style="text-align: center; padding: 20px;">No se encontraron proveedores</td></tr>';
    }
    
    return data.map(supplier => {
        const statusClass = supplier.status === 'Active' ? 'status-completed' : 'status-danger';
        const pendingBadge = supplier.pendingServices > 0 ? 
            `<span class="status status-pending" style="margin-left: 10px;">${supplier.pendingServices} Pend.</span>` : '';
        const ratingColor = supplier.rating < 4.0 ? '#dc3545' : '#28a745';
        
        return `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.servicesCount} ${pendingBadge}</td>
                <td style="color: ${ratingColor}; font-weight: 600;">${supplier.rating} ⭐</td>
                <td><span class="status ${statusClass}">${supplier.status === 'Active' ? 'Activo' : 'Suspendido'}</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${supplier.id}" data-type="supplier">Auditar</button></td>
            </tr>
        `;
    }).join('');
}

function renderServicesTableBody(data) {
    if (!data || data.length === 0) {
        return '<tr><td colspan="7" style="text-align: center; padding: 20px;">No se encontraron servicios</td></tr>';
    }
    
    return data.map(service => {
        const statusClass = service.status === 'Approved' ? 'status-completed' : 'status-pending';
        const ratingDisplay = service.rating > 0 ? `${service.rating} ⭐` : 'N/A';
        
        return `
            <tr>
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.supplier}</td>
                <td>${service.category}</td>
                <td>${ratingDisplay}</td>
                <td><span class="status ${statusClass}">${service.status === 'Approved' ? 'Aprobado' : 'Pendiente'}</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${service.id}" data-type="service">Auditar</button></td>
            </tr>
        `;
    }).join('');
}

function renderReviewsTableBody(data) {
    if (!data || data.length === 0) {
        return '<tr><td colspan="7" style="text-align: center; padding: 20px;">No se encontraron reseñas</td></tr>';
    }
    
    return data.map(review => {
        const statusClass = review.rating <= 2 ? 'status-danger' : 'status-completed';
        
        return `
            <tr>
                <td>${review.id}</td>
                <td>${review.supplier}</td>
                <td>${review.service}</td>
                <td>${review.rating} ⭐</td>
                <td>${review.comment.substring(0, 50)}...</td>
                <td><span class="status ${statusClass}">Monitoreada</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${review.id}" data-type="review">Leer</button></td>
            </tr>
        `;
    }).join('');
}

function renderSupportTicketsTableBody(data) {
    if (!data || data.length === 0) {
        return '<tr><td colspan="6" style="text-align: center; padding: 20px;">No hay solicitudes de soporte registradas</td></tr>';
    }
    
    return data.map(ticket => {
        let statusClass = 'status-pending';
        if (ticket.status === 'Cerrado') statusClass = 'status-completed';
        if (ticket.status === 'En Proceso') statusClass = 'status-warning';
        
        return `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.subject}</td>
                <td>${ticket.user}</td>
                <td>${ticket.date}</td>
                <td><span class="status ${statusClass}">${ticket.status}</span></td>
                <td><button class="btn-primary btn-action view-btn" data-id="${ticket.id}" data-type="support">Ver</button></td>
            </tr>
        `;
    }).join('');
}

const views = {
    dashboard: () => `
        <h2 style="margin-bottom: 25px;">Monitoreo de Calidad y Operaciones</h2>
        <section class="stats">
            <div class="stat-card" style="background: #fff9e6;">
                <i class="ri-globe-line" style="color: #ffc107;"></i>
                <h2 style="color: #ffc107;">${dashboardMetrics.totalServicesRegistered}</h2>
                <p><strong>Servicios Registrados</strong></p>
            </div>

            <div class="stat-card" style="background: #e6f7ff;">
                <i class="ri-user-add-line" style="color: #007bff;"></i>
                <h2 style="color: #007bff;">${dashboardMetrics.newUsers}</h2>
                <p><strong>Nuevos Usuarios</strong> (Últimos 30 días)</p>
            </div>
            
            <div class="stat-card">
                <i class="ri-group-line"></i>
                <h2>${dashboardMetrics.totalUsers}</h2>
                <p>Total Usuarios</p>
            </div>
        </section>
        <div class="card" style="margin-top: 30px;">
            <h3 style="color: #004a8f;"><i class="ri-pie-chart-line"></i> Tendencias Operacionales</h3>
            <p style="color: #555;">Gráficos clave de monitoreo (Placeholder para integración con charts).</p>
        </div>
    `,
    suppliers: () => `
        <h2>🤝 Monitoreo de Proveedores</h2>

        <section class="stats" style="margin-bottom: 20px;">
            <div class="stat-card">
                <i class="ri-building-line"></i>
                <h2>${dashboardMetrics.activeSuppliers}</h2>
                <p>Proveedores Activos</p>
            </div>
            <div class="stat-card">
                <i class="ri-star-line"></i>
                <h2>${dashboardMetrics.avgSupplierRating}</h2>
                <p>Rating Promedio Proveedores</p>
            </div>
            <div class="stat-card" style="background: #fcebeb;">
                <i class="ri-alert-line" style="color: #dc3545;"></i>
                <h2 style="color: #dc3545;">${dashboardMetrics.lowRatingSuppliersCount}</h2>
                <p>Proveedores con Rating Bajo</p>
            </div>
        </section>
        
        <div class="card" style="padding: 20px;">
            <div class="action-bar">
                <button class="btn-primary" id="low-rating-filter-btn">Ver Proveedores con Rating Bajo (< 4.0)</button>
            </div>
            <h4 class="suppliers-subtitle">Lista Completa de Proveedores (${dummySupplierData.length} resultados)</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Fiscal</th>
                        <th># Servicios</th>
                        <th>Rating Prom.</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="supplier-list">${renderSupplierTableBody(dummySupplierData)}</tbody>
            </table>
        </div>
    `,
    services_directory: () => `
        <h2>🌍 Directorio de Servicios Turísticos</h2>
        <div class="card" style="padding: 20px;">
            <p>Monitoreo y gestión del catálogo de servicios publicados.</p>
            <form id="service-filter-form" class="filter-form" style="margin: 20px 0;">
                <input type="text" id="filter-service-name" placeholder="Nombre/ID del Servicio" class="input-field" style="margin-right: 10px;">
                <select id="filter-status" class="input-field" style="margin-right: 10px;">
                    <option value="">Todos los Estados</option>
                    <option value="Approved">Aprobados</option>
                    <option value="Pending">Pendientes de Aprobación</option>
                </select>
                <button type="submit" class="btn-primary">🔍 Aplicar Filtros</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Proveedor</th>
                        <th>Categoría</th>
                        <th>Rating Prom.</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="services-tbody">${renderServicesTableBody(dummyServicesDirectory)}</tbody>
            </table>
        </div>
    `,
    reviews: () => `
        <h2>⭐ Gestión de Reseñas</h2>
        <div class="card" style="padding: 20px;">
            <p>Monitoreo de feedback para la gestión de calidad.</p>
            <table>
                <thead>
                    <tr>
                        <th>ID Reseña</th>
                        <th>Proveedor</th>
                        <th>Servicio</th>
                        <th>Rating</th>
                        <th>Comentario</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="reviews-tbody">${renderReviewsTableBody(dummyReviewData)}</tbody>
            </table>
        </div>
    `,
    users: () => `
        <h2>👥 Listado de Usuarios Registrados</h2>
        
        <section class="stats" style="margin-bottom: 20px;">
            <div class="stat-card">
                <i class="ri-user-line"></i>
                <h2>${dashboardMetrics.totalUsers}</h2>
                <p>Total Usuarios Registrados</p>
            </div>
            <div class="stat-card" style="background: #e6f7ff;">
                <i class="ri-user-add-line" style="color: #007bff;"></i>
                <h2 style="color: #007bff;">${dashboardMetrics.newUsers}</h2>
                <p>Nuevos Usuarios (Últimos 30 días)</p>
            </div>
            <div class="stat-card" style="background: #f0f0f0;">
                <i class="ri-user-star-line" style="color: #6c757d;"></i>
                <h2 style="color: #6c757d;">${dashboardMetrics.oldUsers}</h2>
                <p>Usuarios Antiguos (Más de 30 días)</p>
            </div>
        </section>
        
        <div class="card">
            <p style="margin-bottom: 20px;">Gestión de usuarios y control de acceso.</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Registrado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${dummyUserData.length > 0 ? dummyUserData.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.registeredDate}</td>
                            <td><button class="btn-secondary btn">Bloquear</button></td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay usuarios registrados</td></tr>'}
                </tbody>
            </table>
        </div>
    `,
    help_center: () => `
        <h2>❓ Centro de Ayuda y Soporte</h2>
        
        <div class="card" style="margin-top: 30px;">
            <h3 style="margin-bottom: 15px;">📋 Historial de Solicitudes</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID Ticket</th>
                        <th>Asunto</th>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="support-tickets-tbody">${renderSupportTicketsTableBody(dummySupportTickets)}</tbody>
            </table>
        </div>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    
    if (DOM.navLinks) {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                const viewName = link.getAttribute('data-view');
                if (viewName) loadView(viewName);
            });
        });
    }
    
    if (DOM.logoutBtnSidebar) {
        DOM.logoutBtnSidebar.addEventListener('click', handleLogout);
    }

    if (DOM.mainContent) {
        DOM.mainContent.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('view-btn')) {
                const id = target.getAttribute('data-id');
                const type = target.getAttribute('data-type');
                
                if (DOM.detailModal) {
                    const modalTitle = DOM.detailModal.querySelector('#modal-title');
                    const modalBody = DOM.detailModal.querySelector('#modal-body-content');
                    
                    if (modalTitle) {
                        modalTitle.textContent = `Auditoría - Detalle de ${type.toUpperCase()} #${id}`;
                    }
                    if (modalBody) {
                        modalBody.innerHTML = `<p><strong>ID:</strong> ${id}</p><p>Detalle para auditoría de ${type}.</p>`;
                    }
                    DOM.detailModal.style.display = 'block';
                }
            }
        });
    }
    
    if (DOM.closeModalBtn && DOM.detailModal) {
        DOM.closeModalBtn.onclick = () => { 
            DOM.detailModal.style.display = 'none'; 
        };
    }
    
    window.onclick = (event) => { 
        if (DOM.detailModal && event.target === DOM.detailModal) {
            DOM.detailModal.style.display = 'none'; 
        }
    };

    const initialView = window.location.hash.substring(1) || 'dashboard';
    loadView(initialView);
});