document.getElementById("serviceForm").addEventListener("submit", function(e) {
    const confirmSend = confirm("¿Desea registrar este servicio?");
    if (!confirmSend) {
        e.preventDefault();
    } else {
        alert("Servicio registrado correctamente.");
    }
});
