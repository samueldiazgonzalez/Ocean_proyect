// Datos iniciales (simulación)
let provider = {
  name: "Javier Pérez",
  role: "Plomero Certificado · Técnico HVAC",
  bio: "Profesional con 8 años de experiencia ofreciendo soluciones confiables en plomería y climatización.",
  location: "Madrid, España",
  rating: "4.8"
};

let services = [
  { 
    id: "T-2001", 
    title: "Tour guiado por la ciudad", 
    desc: "Recorrido turístico con guía profesional, incluye transporte y actividades culturales.", 
    rate: "€45 por persona", 
    status: "Activo" 
  },

  { 
    id: "T-2002", 
    title: "Reserva de alojamiento", 
    desc: "Gestión completa de reservas hoteleras, check-in, check-out y asistencia al huésped.", 
    rate: "€20 por reserva", 
    status: "Activo" 
  },

  { 
    id: "T-2003", 
    title: "Traslado aeropuerto–hotel", 
    desc: "Servicio de transporte privado o compartido desde y hacia el aeropuerto.", 
    rate: "€30 por trayecto", 
    status: "Activo" 
  },

  { 
    id: "T-2004", 
    title: "Paquete turístico completo", 
    desc: "Incluye hotel, actividades guiadas, transporte interno y asistencia las 24h.", 
    rate: "€180 por persona", 
    status: "Activo" 
  }
];

// Elementos DOM
const servicesList = document.getElementById('servicesList');
const serviceCount = document.getElementById('serviceCount');
const modalBackdrop = document.getElementById('modalBackdrop');
const modal = document.getElementById('modal');

// Render inicial
function renderServices(filter=""){
  servicesList.innerHTML = '';
  const filtered = services.filter(s=> s.title.toLowerCase().includes(filter.toLowerCase()) || s.desc.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'service';
    el.innerHTML = `
      <div class="left">
        <div class="icon">${s.title.charAt(0).toUpperCase()}</div>
        <div>
          <h4>${escapeHtml(s.title)}</h4>
          <p>${escapeHtml(s.desc)}</p>
          <div class="meta">${escapeHtml(s.rate)} · <span class="pill">${escapeHtml(s.status)}</span></div>
        </div>
      </div>
      <div class="actions">
        <div style="display:flex;gap:8px">
          <button class="btn ghost" data-action="edit" data-id="${s.id}">Editar</button>
          <button class="btn" data-action="toggle" data-id="${s.id}">${s.status === 'Activo' ? 'Pausar' : 'Activar'}</button>
        </div>
        <button class="btn ghost" data-action="delete" data-id="${s.id}">Eliminar</button>
      </div>
    `;
    servicesList.appendChild(el);
  });
  serviceCount.textContent = `${filtered.length} servicios`;
}
renderServices();

// Buscador
document.getElementById('search').addEventListener('input', (e)=> renderServices(e.target.value));

// Modal helpers
function openModal(html){
  modal.innerHTML = html;
  modalBackdrop.hidden = false;
  modalBackdrop.style.display = 'flex';
}
function closeModal(){
  modalBackdrop.hidden = true;
  modalBackdrop.style.display = 'none';
  modal.innerHTML = '';
}
modalBackdrop.addEventListener('click', (e)=>{ if(e.target === modalBackdrop) closeModal(); });

// Añadir servicio
document.getElementById('btnAddService').addEventListener('click', ()=>{
  openModal(`
    <h3>Añadir servicio</h3>
    <div>
      <div class="form-row"><input id="s_title" placeholder="Título del servicio"></div>
      <div class="form-row"><textarea id="s_desc" rows="3" placeholder="Descripción"></textarea></div>
      <div class="form-row"><input id="s_rate" placeholder="Tarifa (ej: €50/hora)"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn ghost" id="cancelAdd">Cancelar</button>
        <button class="btn primary" id="confirmAdd">Guardar servicio</button>
      </div>
    </div>
  `);
  document.getElementById('cancelAdd').addEventListener('click', closeModal);
  document.getElementById('confirmAdd').addEventListener('click', ()=>{
    const title = document.getElementById('s_title').value.trim();
    const desc = document.getElementById('s_desc').value.trim();
    const rate = document.getElementById('s_rate').value.trim() || '€0/hora';
    if(!title){ alert('Escribe un título para el servicio'); return; }
    services.unshift({ id: 'S-' + Math.floor(Math.random()*9000+1000), title, desc, rate, status: 'Activo' });
    renderServices();
    closeModal();
  });
});

// Delegación acciones servicios
servicesList.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(action === 'edit'){
    const serv = services.find(s=>s.id===id);
    if(!serv) return;
    openModal(`
      <h3>Editar servicio</h3>
      <div>
        <div class="form-row"><input id="s_title" value="${escapeHtml(serv.title)}"></div>
        <div class="form-row"><textarea id="s_desc" rows="3">${escapeHtml(serv.desc)}</textarea></div>
        <div class="form-row"><input id="s_rate" value="${escapeHtml(serv.rate)}"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button class="btn ghost" id="cancelEdit">Cancelar</button>
          <button class="btn primary" id="confirmEdit">Guardar</button>
        </div>
      </div>
    `);
    document.getElementById('cancelEdit').addEventListener('click', closeModal);
    document.getElementById('confirmEdit').addEventListener('click', ()=>{
      serv.title = document.getElementById('s_title').value.trim() || serv.title;
      serv.desc  = document.getElementById('s_desc').value.trim() || serv.desc;
      serv.rate  = document.getElementById('s_rate').value.trim() || serv.rate;
      renderServices();
      closeModal();
    });
  } else if(action === 'toggle'){
    const serv = services.find(s=>s.id===id);
    if(serv){ serv.status = serv.status === 'Activo' ? 'Pausado' : 'Activo'; renderServices(); }
  } else if(action === 'delete'){
    if(confirm('¿Eliminar este servicio?')){ services = services.filter(s=>s.id!==id); renderServices(); }
  }
});

// Editar perfil
document.getElementById('btnEditProfile').addEventListener('click', ()=>{
  openModal(`
    <h3>Editar perfil</h3>
    <div>
      <div class="form-row"><input id="p_name" value="${escapeHtml(provider.name)}" placeholder="Nombre"></div>
      <div class="form-row"><input id="p_role" value="${escapeHtml(provider.role)}" placeholder="Rol/título"></div>
      <div class="form-row"><input id="p_location" value="${escapeHtml(provider.location)}" placeholder="Ubicación"></div>
      <div class="form-row"><textarea id="p_bio" rows="4" placeholder="Biografía">${escapeHtml(provider.bio)}</textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn ghost" id="cancelProfile">Cancelar</button>
        <button class="btn primary" id="saveProfile">Guardar</button>
      </div>
    </div>
  `);
  document.getElementById('cancelProfile').addEventListener('click', closeModal);
  document.getElementById('saveProfile').addEventListener('click', ()=>{
    provider.name = document.getElementById('p_name').value.trim() || provider.name;
    provider.role = document.getElementById('p_role').value.trim() || provider.role;
    provider.location = document.getElementById('p_location').value.trim() || provider.location;
    provider.bio = document.getElementById('p_bio').value.trim() || provider.bio;
    document.getElementById('provName').textContent = provider.name;
    document.getElementById('provRole').textContent = provider.role;
    document.getElementById('provBio').textContent = provider.bio;
    closeModal();
  });
});

// Ver perfil público
document.getElementById('btnViewPublic').addEventListener('click', ()=>{
  openModal(`
    <h3>Perfil público</h3>
    <div style="display:flex;gap:12px">
      <div style="width:92px;height:92px;overflow:hidden;border-radius:8px">
        <img src="/mnt/data/bfc06b89-3f75-4cf9-afcb-be8d82a5d930.png" style="width:100%;height:100%;object-fit:cover">
      </div>
      <div style="flex:1">
        <strong>${escapeHtml(provider.name)}</strong>
        <div class="muted">${escapeHtml(provider.role)}</div>
        <div class="muted" style="margin-top:8px">${escapeHtml(provider.bio)}</div>
        <div style="margin-top:8px" class="pill">${escapeHtml(provider.location)}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px">
      <button class="btn ghost" id="closePublic">Cerrar</button>
    </div>
  `);
  document.getElementById('closePublic').addEventListener('click', closeModal);
});

// Contacto demo
document.getElementById('btnContact').addEventListener('click', ()=> alert('Demo: abrir chat o email al proveedor'));

// Escape simple para evitar XSS
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}
