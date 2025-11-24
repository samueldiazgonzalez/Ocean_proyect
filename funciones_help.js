// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el Acordeón (FAQ)
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const contentId = this.getAttribute('data-target');
            const content = document.getElementById(contentId);
            const item = this.closest('.accordion-item');

            // Cierra todos los contenidos excepto el actual
            document.querySelectorAll('.accordion-content').forEach(c => {
                if (c !== content) {
                    c.style.display = 'none';
                    c.closest('.accordion-item').classList.remove('active');
                }
            });

            // Alternar la visibilidad del contenido actual
            if (content.style.display === 'block') {
                content.style.display = 'none';
                item.classList.remove('active');
            } else {
                content.style.display = 'block';
                item.classList.add('active');
            }
        });
    });

    // Lógica para el Envío del Formulario (AJAX)
    const supportForm = document.getElementById('supportForm');
    const formMessage = document.getElementById('formMessage');

    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Detener el envío tradicional

            // Limpiar mensajes y preparar para el envío
            formMessage.textContent = 'Enviando...';
            formMessage.className = 'message-status';

            const formData = new FormData(this);

            // Usar Fetch API para enviar los datos de forma asíncrona
            fetch('enviar_soporte.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json()) // Esperar la respuesta JSON de PHP
            .then(data => {
                formMessage.textContent = data.message;
                
                if (data.status === 'success') {
                    formMessage.classList.add('success');
                    supportForm.reset(); // Limpiar el formulario
                } else {
                    formMessage.classList.add('error');
                }
            })
            .catch(error => {
                console.error('Error de conexión:', error);
                formMessage.textContent = 'Hubo un problema de conexión con el servidor.';
                formMessage.classList.add('error');
            });
        });
    }
});