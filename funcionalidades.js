/* ============================
   ELEMENTOS DEL DOM
============================ */
const editBtn = document.querySelector(".edit-btn");
let editing = false;

/* ============================
   ELEMENTOS A EDITAR
============================ */
const nombreHeader = document.querySelector(".profile-header h1");

const cardInfo = document.querySelector(".card:nth-child(1)");


/* ============================
   FUNCIÓN PARA MOSTRAR INFO
============================ */
function renderInfoCard() {
  cardInfo.innerHTML = `
    <h3><i class="ri-id-card-line"></i> Información Personal</h3>

    ${
      editing
        ? `
      <label>Nombre completo:</label>
      <input id="nombreInput" type="text" value="${nombre}" class="input-edit">

      <label>Correo:</label>
      <input id="correoInput" type="email" value="${correo}" class="input-edit">

      <label>Teléfono:</label>
      <input id="telInput" type="text" value="${tel}" class="input-edit">

      <label>Ciudad:</label>
      <input id="ciudadInput" type="text" value="${ciudad}" class="input-edit">

      <button id="saveBtn" class="btn-primary">Guardar cambios</button>
    `
        : `
      <p><strong>Nombre completo:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      <p><strong>Teléfono:</strong> ${tel}</p>
      <p><strong>Ciudad:</strong> ${ciudad}</p>
    `
    }
  `;

  if (editing) attachSaveEvent();
}

renderInfoCard();

/* ============================
   EVENTO: EDITAR PERFIL
============================ */
editBtn.addEventListener("click", () => {
  editing = !editing;

  if (editing) {
    editBtn.innerHTML = `<i class="ri-check-line"></i> Guardar`;
  } else {
    editBtn.innerHTML = `<i class="ri-edit-line"></i> Editar Perfil`;
  }

  renderInfoCard();
});

/* ============================
   GUARDAR CAMBIOS
============================ */
function attachSaveEvent() {
  document.getElementById("saveBtn").addEventListener("click", () => {
    nombre = document.getElementById("nombreInput").value;
    correo = document.getElementById("correoInput").value;
    tel = document.getElementById("telInput").value;
    ciudad = document.getElementById("ciudadInput").value;

    // actualizar encabezado
    nombreHeader.textContent = nombre;

    editing = false;
    editBtn.innerHTML = `<i class="ri-edit-line"></i> Editar Perfil`;

    renderInfoCard();
    showToast("Perfil actualizado correctamente");
  });
}

/* ============================
   TOAST
============================ */
const toast = document.createElement("div");
toast.classList.add("toast");
document.body.appendChild(toast);

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
