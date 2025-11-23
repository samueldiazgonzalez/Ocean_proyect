document.addEventListener('DOMContentLoaded', () => {
    
    const registerServiceForm = document.getElementById('registerService');
    const successMsg = document.getElementById('successMessage');

    // ----------------------------------------------------
    // 1. Manejo del Formulario (Confirmación y Envío SIMULADO)
    // ----------------------------------------------------
    if (registerServiceForm) {
        registerServiceForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Detenemos el envío inicial del formulario

            const confirmSend = confirm("¿Desea registrar este servicio?");
            
            if (confirmSend) {
                // Lógica si el usuario confirma el registro
                
                // 1. Mostrar mensaje de éxito simulado
                successMsg.style.display = 'block';
                
                // 2. Subir la página para ver el mensaje
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // 3. Ocultar el mensaje después de 3 segundos
                setTimeout(() => {
                    successMsg.style.display = 'none';
                    // En un entorno real, aquí se enviaría el formulario después de la validación final.
                    // e.target.submit(); // Descomentar para envío real a Registro_php.php
                }, 3000);
            }
            // Si el usuario presiona Cancelar, el 'e.preventDefault()' lo detuvo arriba y no pasa nada.
        });
    }

    // ----------------------------------------------------
    // 2. Preview de imagen principal
    // ----------------------------------------------------
    const mainImageInput = document.getElementById('mainImage');
    const mainPreview = document.getElementById('mainPreview');

    if (mainImageInput) {
        mainImageInput.addEventListener('change', function(e) {
            mainPreview.innerHTML = '';
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    mainPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ----------------------------------------------------
    // 3. Preview de galería
    // ----------------------------------------------------
    const galleryInput = document.getElementById('gallery');
    const galleryPreview = document.getElementById('galleryPreview');

    if (galleryInput) {
        galleryInput.addEventListener('change', function(e) {
            galleryPreview.innerHTML = '';
            const files = Array.from(e.target.files).slice(0, 10);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    galleryPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // ----------------------------------------------------
    // 4. Contador de caracteres para descripción
    // ----------------------------------------------------
    const description = document.querySelector('textarea[name="description"]');
    const charCount = document.querySelector('.character-count');
    
    if (description && charCount) {
        description.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count} / 1000 caracteres`;
            
            if (count > 900) {
                charCount.style.color = '#e74c3c';
            } else {
                charCount.style.color = '#999';
            }
        });
        description.dispatchEvent(new Event('input'));
    }

    // ----------------------------------------------------
    // 5. Efecto de foco en campos
    // ----------------------------------------------------
    document.querySelectorAll('input, textarea, select').forEach(element => {
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            element.addEventListener('focus', function() {
                formGroup.style.transform = 'scale(1.01)';
                formGroup.style.boxShadow = '0 0 8px rgba(0, 123, 255, 0.2)';
            });
            
            element.addEventListener('blur', function() {
                formGroup.style.transform = 'scale(1)';
                formGroup.style.boxShadow = 'none';
            });
        }
    });

});