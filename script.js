document.addEventListener("DOMContentLoaded", () => {
  const products = document.querySelectorAll(".product-card");
  const sortSelect = document.getElementById("sort");
  const viewBtns = document.querySelectorAll(".view-btn");
  const productsGrid = document.getElementById("products");
  const resultsCount = document.getElementById("results-count");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const priceRange = document.getElementById("price-range");
  const filters = document.querySelectorAll("input[type=checkbox][name=categoria], input#valorados, input#disponibles");
  const searchInput = document.getElementById("search"); // 👈 buscador

  // Actualizar rango de precio
  function updatePriceDisplay() {
    priceRange.textContent = `COP $${parseInt(minPrice.value).toLocaleString()} - COP $${parseInt(maxPrice.value).toLocaleString()}`;
    filterProducts();
  }

  minPrice.addEventListener("input", updatePriceDisplay);
  maxPrice.addEventListener("input", updatePriceDisplay);
  
  // Filtrar productos
  function filterProducts() {
    let activeCategories = Array.from(document.querySelectorAll("input[name=categoria]:checked")).map(el => el.value);
    let valorados = document.getElementById("valorados").checked;
    let disponibles = document.getElementById("disponibles").checked;
    let min = parseInt(minPrice.value);
    let max = parseInt(maxPrice.value);
    let searchText = searchInput.value.toLowerCase(); // 👈 texto del buscador

    let visibleCount = 0;

    products.forEach(p => {
      let precio = parseInt(p.dataset.precio);
      let rating = parseFloat(p.dataset.rating);
      let disponible = p.dataset.disponible === "true";
      let categoria = p.dataset.categoria;
      let titulo = p.querySelector(".card-title").textContent.toLowerCase();
      let descripcion = p.querySelector(".card-content").textContent.toLowerCase(); // 👈 también busca en descripción

      let visible = true;

      if (activeCategories.length > 0 && !activeCategories.includes(categoria)) visible = false;
      if (valorados && rating < 4.8) visible = false;
      if (disponibles && !disponible) visible = false;
      if (precio < min || precio > max) visible = false;
      if (searchText && !(titulo.includes(searchText) || descripcion.includes(searchText))) visible = false;

      p.style.display = visible ? "flex" : "none";
      if (visible) visibleCount++;
    });

    resultsCount.textContent = `Mostrando ${visibleCount} experiencias`;
  }

  filters.forEach(f => f.addEventListener("change", filterProducts));

  // Ordenar productos
  sortSelect.addEventListener("change", () => {
    let cards = Array.from(productsGrid.children);

    let sorted = cards.sort((a, b) => {
      let pa = parseInt(a.dataset.precio);
      let pb = parseInt(b.dataset.precio);
      let ra = parseFloat(a.dataset.rating);
      let rb = parseFloat(b.dataset.rating);

      switch (sortSelect.value) {
        case "asc": return pa - pb;
        case "desc": return pb - pa;
        case "rating": return rb - ra;
        case "newest": return Math.random() - 0.5; // ejemplo random
        default: return 0;
      }
    });

    productsGrid.innerHTML = "";
    sorted.forEach(c => productsGrid.appendChild(c));
  });

  // Cambiar vista
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      viewBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.view === "list") {
        productsGrid.classList.add("list-view");
        products.forEach(p => p.style.flexDirection = "row");
      } else {
        productsGrid.classList.remove("list-view");
        products.forEach(p => p.style.flexDirection = "column");
      }
    });
  });

  // Evento buscador
  searchInput.addEventListener("input", filterProducts);

  // Inicializar
  updatePriceDisplay();
  filterProducts();
});