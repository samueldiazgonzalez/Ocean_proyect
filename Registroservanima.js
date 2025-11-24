
let currentStep = 1;
const totalSteps = 4;
const formSteps = document.querySelectorAll('.form-step');
const stepCircles = document.querySelectorAll('.step-circle');
const lines = document.querySelectorAll('.line');


function showStep(step) {
    
    formSteps.forEach((formStep) => {
        formStep.classList.remove('active');
    });
    

    formSteps[step - 1].classList.add('active');

    updateProgressIndicator(step);
}


function updateProgressIndicator(step) {
    stepCircles.forEach((circle, index) => {
        const circleStep = index + 1;
        
        circle.classList.remove('active', 'complete');
        
        if (circleStep < step) {
            circle.classList.add('complete');
        } else if (circleStep === step) {
            circle.classList.add('active');
        }
    });

    lines.forEach((line, index) => {
        if (index < step - 1) {
            line.classList.add('complete');
        } else {
            line.classList.remove('complete');
        }
    });
}

function validateCurrentStep() {
    const currentFormStep = formSteps[currentStep - 1];
    const inputs = currentFormStep.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'red';
            
            input.addEventListener('input', function() {
                this.style.borderColor = '#ddd';
            }, { once: true });
        } else {
            input.style.borderColor = '#ddd';
        }
    });

    return isValid;
}

document.querySelectorAll('.next-step-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        } else {
            alert('Por favor, completa todos los campos obligatorios antes de continuar.');
        }
    });
});

document.querySelectorAll('.prev-step-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

stepCircles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
        const targetStep = index + 1;
        if (targetStep <= currentStep) {
            currentStep = targetStep;
            showStep(currentStep);
        }
    });
});

document.getElementById('registerService').addEventListener('submit', (e) => {
    if (!validateCurrentStep()) {
        e.preventDefault();
        alert('Por favor, completa todos los campos obligatorios antes de registrar.');
    }
    // Si es válido, no bloqueamos -> se envía al PHP
});

function submitFormData(form) {
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Éxito:', data);
        alert('Servicio registrado exitosamente');
        form.reset();
        currentStep = 1;
        showStep(currentStep);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al registrar el servicio');
    });
}
showStep(currentStep);