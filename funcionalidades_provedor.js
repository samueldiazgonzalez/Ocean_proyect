/* ============================
   ELEMENTOS DEL DOM
============================ */
const editBtn = document.querySelector(".btn-primary");
const modal = document.querySelector(".modal-edit");
const modalContent = document.querySelector(".modal-box");
const closeModalBtn = document.querySelector("#closeModal");

const form = document.querySelector("#editForm");

const profileName = document.querySelector("#profileName");
const profileRole = document.querySelector("#profileRole");
const profileAvatar = document.querySelector("#profileAvatar");

/* INPUTS DEL FORMULARIO */
const inputName = document.querySelector("#inputName");
const inputRole = document.querySelector("#inputRole");
const inputAvatar = document.querySelector("#inputAvatar");

/* ============================
   ABRIR MODAL
============================ */
editBtn.addEventListener("click", () => {
  // Cargar valores actuales al formulario
  inputName.value = profileName.textContent;
  inputRole.value = profileRole.textContent;

  modal.classList.add("show");
  setTimeout(() => modalContent.classList.add("popup"), 10);
});

/* ============================
   CERRAR MODAL
============================ */
closeModalBtn.addEventListener("click", () => closeModal());

function closeModal() {
  modalContent.classList.remove("popup");
  setTimeout(() => modal.classList.remove("show"), 200);
}

/* Cierra el modal haciendo clic afuera */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

/* ============================
   GUARDAR CAMBIOS
============================ */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validación básica
  if (inputName.value.trim() === "") {
    alert("El nombre no puede estar vacío.");
    return;
  }

  // Actualizar datos en pantalla
  profileName.textContent = inputName.value;
  profileRole.textContent = inputRole.value;

  // Si cambia la imagen
  if (inputAvatar.files.length > 0) {
    const file = inputAvatar.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      profileAvatar.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  closeModal();
});

/* ============================
   EFECTOS SUAVES
============================ */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});
