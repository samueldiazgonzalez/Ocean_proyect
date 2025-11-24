// ------------------------------
// DATOS INICIALES
// ------------------------------
let services = [
  { 
    id: "T-2001", 
    title: "Tour guiado por la ciudad", 
    desc: "Recorrido turístico con guía profesional, incluye transporte y actividades culturales.", 
    rate: "€45 por persona",
    duration: "2",
    start: "09:00",
    end: "11:00",
    status: "Activo"
  },

  { 
    id: "T-2002", 
    title: "Reserva de alojamiento", 
    desc: "Gestión completa de reservas hoteleras, check-in, check-out y asistencia al huésped.", 
    rate: "€20 por reserva",
    duration: "1",
    start: "08:00",
    end: "09:00",
    status: "Activo"
  },

  { 
    id: "T-2003", 
    title: "Traslado aeropuerto–hotel", 
    desc: "Servicio de transporte privado o compartido desde y hacia el aeropuerto.", 
    rate: "€30 por trayecto",
    duration: "1",
    start: "12:00",
    end: "13:00",
    status: "Activo"
  },

  { 
    id: "T-2004", 
    title: "Paquete turístico completo", 
    desc: "Incluye hotel, actividades guiadas, transporte interno y asistencia las 24h.", 
    rate: "€180 por persona",
    duration: "5",
    start: "07:00",
    end: "12:00",
    status: "Activo"
  }
];

let selectedService = null;

// ------------------------------
// ELEMENTOS DOM
// ------------------------------
const listEl = document.getElementById("servicesList");
const detailCard = document.getElementById("serviceDetail");
const emptyRight = document.getElementById("emptyRight");

const inTitle = document.getElementById("detail_title");
const inDesc = document.getElementById("detail_desc");
const inRate = document.getElementById("detail_rate");
const inDuration = document.getElementById("detail_duration");
const inStart = document.getElementById("detail_start");
const inEnd = document.getElementById("detail_end");

const btnAdd = document.getElementById("btnAdd");
const btnSave = document.getElementById("detailSave");
const btnCancel = document.getElementById("detailCancel");

const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");


// ------------------------------
// RENDER LISTA
// ------------------------------
function renderList() {
  listEl.innerHTML = "";

  const text = search.value.toLowerCase();
  const filter = statusFilter.value;

  services
    .filter(s => 
      (s.title.toLowerCase().includes(text) || s.desc.toLowerCase().includes(text)) &&
      (filter === "all" || s.status === filter)
    )
    .forEach(s => {
      const item = document.createElement("div");
      item.className = "service";

      item.innerHTML = `
        <div class="left">
          <div class="icon">${s.title.charAt(0).toUpperCase()}</div>
          <div>
            <h4>${s.title}</h4>
            <p>${s.desc}</p>
            <div class="meta">${s.rate} · <span class="pill">${s.status}</span></div>
          </div>
        </div>  
  <div class="actions">
    <a href="editar_servicio.php?id=${s.id}" class="btn ghost">Editar</a>
    <button class="btn" data-toggle="${s.id}">
      ${s.status === "Activo" ? "Pausar" : "Activar"}
    </button>
  </div>
`;

      listEl.appendChild(item);
    });
}

renderList();


// ------------------------------
// MOSTRAR DETALLE
// ------------------------------
function showDetails(service) {
  selectedService = service;

  emptyRight.classList.add("hidden");
  detailCard.classList.remove("hidden");

  inTitle.value = service.title;
  inDesc.value = service.desc;
  inRate.value = service.rate;
  inDuration.value = service.duration;
  inStart.value = service.start;
  inEnd.value = service.end;
}


// ------------------------------
// LIMPIAR PARA NUEVO SERVICIO
// ------------------------------
function newService() {
  selectedService = null;

  emptyRight.classList.add("hidden");
  detailCard.classList.remove("hidden");

  inTitle.value = "";
  inDesc.value = "";
  inRate.value = "";
  inDuration.value = "";
  inStart.value = "";
  inEnd.value = "";
}


// ------------------------------
// GUARDAR SERVICIO
// ------------------------------
btnSave.addEventListener("click", () => {
  const data = {
    title: inTitle.value.trim(),
    desc: inDesc.value.trim(),
    rate: inRate.value.trim(),
    duration: inDuration.value.trim(),
    start: inStart.value,
    end: inEnd.value,
  };

  if (!data.title) {
    alert("El título es obligatorio");
    return;
  }

  if (selectedService) {
    // EDITAR
    selectedService.title = data.title;
    selectedService.desc = data.desc;
    selectedService.rate = data.rate;
    selectedService.duration = data.duration;
    selectedService.start = data.start;
    selectedService.end = data.end;
  } else {
    // NUEVO
    services.unshift({
      id: "S-" + Math.floor(Math.random() * 90000 + 10000),
      status: "Activo",
      ...data
    });
  }

  renderList();
  detailCard.classList.add("hidden");
  emptyRight.classList.remove("hidden");
});


// ------------------------------
// CANCELAR EDICIÓN
// ------------------------------
btnCancel.addEventListener("click", () => {
  detailCard.classList.add("hidden");
  emptyRight.classList.remove("hidden");
});


// ------------------------------
// EVENTOS LISTA
// ------------------------------
listEl.addEventListener("click", e => {
  const editId = e.target.dataset.edit;
  const toggleId = e.target.dataset.toggle;

  if (editId) {
    const serv = services.find(s => s.id === editId);
    showDetails(serv);
  }

  if (toggleId) {
    const serv = services.find(s => s.id === toggleId);
    serv.status = serv.status === "Activo" ? "Pausado" : "Activo";
    renderList();
  }
});


// ------------------------------
// BUSCADOR Y FILTRO
// ------------------------------
search.addEventListener("input", renderList);
statusFilter.addEventListener("change", renderList);


// ------------------------------
// BOTÓN AÑADIR
// ------------------------------
btnAdd.addEventListener("click", newService);
