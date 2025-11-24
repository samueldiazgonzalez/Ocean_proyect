document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtención de Elementos del DOM
    const productsContainer = document.getElementById("products"); 
    const products = Array.from(productsContainer.querySelectorAll(".product-card"));
    const sortSelect = document.getElementById("sort");
    const viewBtns = document.querySelectorAll(".view-btn");
    const resultsCount = document.getElementById("results-count");
    const minPriceInput = document.getElementById("min-price"); 
    const maxPriceInput = document.getElementById("max-price"); 
    const priceRangeDisplay = document.getElementById("price-range"); 
    
    // Lista unificada de todos los filtros de checkbox
    // IMPORTANTE: Incluye 'duracion' y 'categoria'
    const filters = document.querySelectorAll("input[type=checkbox][name=categoria], input[type=checkbox][name=duracion], input#valorados, input#disponibles");
    const searchInput = document.getElementById("search");

    // 2. Funciones de Ayuda
    function formatPrice(number) {
        return new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0 
        }).format(number);
    }

    function updatePriceDisplay() {
        let minVal = parseInt(minPriceInput.value);
        let maxVal = parseInt(maxPriceInput.value);
        
        // Ajusta el rango si el mínimo es mayor que el máximo
        if (minVal > maxVal) {
             [minVal, maxVal] = [maxVal, minVal]; 
             minPriceInput.value = minVal;
             maxPriceInput.value = maxVal;
        }

        priceRangeDisplay.textContent = `${formatPrice(minVal)} - ${formatPrice(maxVal)}`;
        applyAllChanges(); // Aplica el filtrado inmediatamente
    }

    // 3. Lógica de Ordenamiento
    function sortProducts(list) {
        const sortBy = sortSelect.value;
        list.sort((a, b) => {
            const pa = parseInt(a.dataset.precio);
            const pb = parseInt(b.dataset.precio);
            const ra = parseFloat(a.dataset.rating);
            const rb = parseFloat(b.dataset.rating);

            switch (sortBy) {
                case "asc": return pa - pb;
                case "desc": return pb - pa;
                case "rating": return rb - ra;
                case "newest": return 0; // Se mantiene el orden existente (o se podría usar un data-timestamp)
                default: return 0;
            }
        });
        // Reinserta los elementos ordenados en el contenedor
        list.forEach(card => productsContainer.appendChild(card));
    }

    // 4. Lógica Principal: Filtrar y Reordenar
    function applyAllChanges() {
        // Obtención de valores activos de los filtros
        const activeCategories = Array.from(document.querySelectorAll("input[name=categoria]:checked")).map(el => el.value);
        const activeDurations = Array.from(document.querySelectorAll("input[name=duracion]:checked")).map(el => el.value);
        const valoradosChecked = document.getElementById("valorados").checked;
        const disponiblesChecked = document.getElementById("disponibles").checked;
        const minPrice = parseInt(minPriceInput.value);
        const maxPrice = parseInt(maxPriceInput.value);
        const searchText = searchInput.value.toLowerCase().trim();

        let visibleProducts = [];
        let totalCount = 0;

        products.forEach(p => {
            // Lectura de data attributes
            const precio = parseInt(p.dataset.precio);
            const rating = parseFloat(p.dataset.rating);
            const disponible = p.dataset.disponible === "true";
            const categoria = p.dataset.categoria;
            const productoDuracion = p.dataset.duracion; 
            
            // Lectura de contenido para búsqueda de texto
            const titulo = p.querySelector(".card-title").textContent.toLowerCase();
            const contenido = p.querySelector(".card-content").textContent.toLowerCase();

            let visible = true;
            
            // --- Criterios de Filtrado ---
            
            // FILTRO 1: Categoría
            if (activeCategories.length > 0 && !activeCategories.includes(categoria)) visible = false;
            
            // FILTRO 2: Duración
            if (activeDurations.length > 0 && !activeDurations.includes(productoDuracion)) visible = false;
            
            // FILTRO 3: Mejor valorados (>= 4.8)
            if (valoradosChecked && rating < 4.8) visible = false;
            
            // FILTRO 4: Disponibles
            if (disponiblesChecked && !disponible) visible = false;
            
            // FILTRO 5: Rango de Precio
            if (precio < minPrice || precio > maxPrice) visible = false;
            
            // FILTRO 6: Búsqueda de Texto
            if (searchText && !(titulo.includes(searchText) || contenido.includes(searchText))) visible = false;

            // --- Actualizar Visibilidad ---
            if (visible) {
                p.style.display = "flex";
                visibleProducts.push(p);
                totalCount++;
            } else {
                p.style.display = "none";
            }
        });

        // Aplicar ordenamiento a la lista filtrada
        sortProducts(visibleProducts);

        // Actualizar Contador
        resultsCount.textContent = `Mostrando ${totalCount} de ${products.length} experiencias`;
    }

    // 5. Lógica de Cambio de Vista (Grid/List)
    viewBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            viewBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (btn.dataset.view === "list") {
                productsContainer.classList.remove("products-grid");
                productsContainer.classList.add("products-list");
            } else {
                productsContainer.classList.remove("products-list");
                productsContainer.classList.add("products-grid");
            }
        });
    });

    // 6. Event Listeners
    // Dispara applyAllChanges() al cambiar cualquier checkbox, select o input de búsqueda.
    filters.forEach(f => f.addEventListener("change", applyAllChanges));
    searchInput.addEventListener("input", applyAllChanges);
    sortSelect.addEventListener("change", applyAllChanges); 
    
    // Dispara updatePriceDisplay() (que a su vez llama a applyAllChanges) al mover los sliders.
    minPriceInput.addEventListener("input", updatePriceDisplay);
    maxPriceInput.addEventListener("input", updatePriceDisplay);

    // 7. Inicialización
    // Asegura que el display de precios y el filtrado inicial se apliquen al cargar la página.
    updatePriceDisplay();
    // applyAllChanges(); se llama dentro de updatePriceDisplay()
});