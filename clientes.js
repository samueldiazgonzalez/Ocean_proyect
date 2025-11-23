// Lista con estrellas y reseñas
const clientes = [
    {
        nombre: "Juan López",
        servicio: "Tour guiado por la ciudad",
        fecha: "2024-05-14",
        rating: 4.5,
        review: "Muy buena experiencia, el guía fue amable y explicó todo."
    },
    {
        nombre: "María Pérez",
        servicio: "Tour guiado por la ciudad",
        fecha: "2024-05-20",
        rating: 4.5,
        review: "El tour fue genial, solo faltó un poco más de tiempo en el mirador."
    },
    {
        nombre: "Carlos Ramírez",
        servicio: "Tour guiado por la ciudad",
        fecha: "2024-06-01",
        rating: 5,
        review: "Increíble tour, lo volvería a repetir sin duda alguna."
    }
];

const tablaBody = document.querySelector("#clientesTabla tbody");

// Crear estrellas visuales
function generarEstrellas(rating) {
    const estrellaLlena = "★";
    const estrellaMedia = "⯪"; // media estrella
    const estrellaVacia = "☆";

    let html = "";

    const enteras = Math.floor(rating);
    const decimal = rating - enteras;

    for (let i = 0; i < enteras; i++) html += estrellaLlena;

    if (decimal >= 0.5) html += estrellaMedia;

    while (html.length < 5) html += estrellaVacia;

    return html;
}

// Insertar clientes en la tabla
clientes.forEach(cliente => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${cliente.nombre}</td>
        <td>${cliente.servicio}</td>
        <td>${cliente.fecha}</td>
        <td class="stars">${generarEstrellas(cliente.rating)}</td>
        <td class="review">"${cliente.review}"</td>
    `;

    tablaBody.appendChild(fila);
});
