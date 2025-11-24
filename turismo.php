<?php
session_start(); // inicia la sesión

// Conexión a la base de datos 
$servername = "db";
$username   = "root";
$password   = "rootpass";
$dbname     = "OceanDB";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("❌ Conexión fallida: " . $conn->connect_error);
}

// Variable para saber si hay sesión activa
$logged_in = isset($_SESSION['user_id']);
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ocean - Tu plataforma de experiencias turísticas</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  
  <header class="header">
    <div class="header-top">
      <div class="container">
        <div class="contact-info">
          <span><i class="fas fa-phone"></i> +57 311 653 1741</span>
          <span><i class="fas fa-envelope"></i> info@oceansystem.com</span>
        </div>
        <div class="social-links">
          <a href="https://www.facebook.com"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="container">
        <div class="logo">
          <i class="fas fa-compass"></i>
          Ocean
        </div>
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="search" class="search-input" placeholder="Buscar destinos, tours, hospedajes...">
        </div>
        <nav class="main-nav">
          <a href="turismo.php"><i class="fas fa-home"></i> Inicio</a>
          <a href="mis_reservas.php"><i class="fas fa-bookmark"></i> Mis Reservas</a>
          <a href="#"><i class="fas fa-tags"></i> Ofertas</a>
          <a href="ayuda.html" class="active"><i class="fas fa-question-circle"></i> Ayuda</a>

          <?php if ($logged_in): ?>
            <a href="perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
          <?php else: ?>
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Iniciar Sesión</a>
            <a href="roles.html" class="btn-register"><i class="fas fa-user-plus"></i> Regístrate</a>
          <?php endif; ?>
        </nav>
      </div>
    </div>
  </header>

  
  <section class="hero-banner" style="background-image: linear-gradient(135deg, rgba(0, 102, 204, 0.8), rgba(0, 180, 216, 0.7)), 
  url('imagenes/3.-el-turismo-como-actividad-economica-min-1-scaled.jpg'); background-size: cover; background-position: center;">
    <div class="hero-content">
      <h1 class="hero-title">Descubre Colombia como nunca antes</h1>
      <p class="hero-subtitle">Conectamos viajeros con las mejores agencias locales para experiencias únicas e inolvidables</p>
      <a href="#productos" class="hero-cta">
        <i class="fas fa-rocket"></i> Comenzar mi aventura
      </a>
    </div>
  </section>

  <div class="main-container">
    
    <aside class="sidebar">
      <div class="filter-section">
        <h3 class="filter-title">
          <i class="fas fa-list"></i>
          Categorías
        </h3>
        <div class="filter-group">
          <div class="filter-option">
            <input type="checkbox" id="cat1" name="categoria" value="Tours de aventura">
            <label for="cat1"><i class="fas fa-mountain"></i> Tours de aventura</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="cat2" name="categoria" value="Playas">
            <label for="cat2"><i class="fas fa-umbrella-beach"></i> Playas</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="cat3" name="categoria" value="Hospedaje">
            <label for="cat3"><i class="fas fa-bed"></i> Hospedaje</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="cat4" name="categoria" value="Transporte">
            <label for="cat4"><i class="fas fa-car"></i> Transporte</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="cat5" name="categoria" value="Guías locales">
            <label for="cat5"><i class="fas fa-user-tie"></i> Guías locales</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="cat6" name="categoria" value="Paquetes completos">
            <label for="cat6"><i class="fas fa-gift"></i> Paquetes completos</label>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3 class="filter-title">
          <i class="fas fa-filter"></i>
          Filtros especiales
        </h3>
        <div class="filter-group">
          <div class="filter-option">
            <input type="checkbox" id="valorados" name="valorados">
            <label for="valorados"><i class="fas fa-star"></i> Mejor valorados (≥4.8)</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="disponibles" name="disponibles">
            <label for="disponibles"><i class="fas fa-check-circle"></i> Disponibles hoy</label>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3 class="filter-title">
          <i class="fas fa-dollar-sign"></i>
          Rango de precio
        </h3>
        <div class="price-range-container">
          <div class="price-inputs">
            <input type="range" id="min-price" class="price-input" min="0" max="300000" step="10000" value="0">
            <input type="range" id="max-price" class="price-input" min="50000" max="300000" step="10000" value="300000">
          </div>
          <div class="price-display" id="price-range">
            COP $0 - COP $300,000
          </div>
        </div>
      </div>
    </aside>

    
    <main class="product-section" id="productos">
      <div class="section-header">
        <h2 class="section-title">Explora experiencias únicas</h2>
        <select id="sort" class="sort-select">
          <option value="">Ordenar por...</option>
          <option value="asc">Precio: Bajo a Alto</option>
          <option value="desc">Precio: Alto a Bajo</option>
          <option value="rating">Mejor Valorados</option>
          <option value="newest">Más Recientes</option>
        </select>
      </div>

      <div class="stats-bar">
        <div class="results-count" id="results-count">
          Mostrando 6 de 6 experiencias
        </div>
        <div class="view-toggle">
          <button class="view-btn active" data-view="grid" aria-label="Vista en cuadrícula">
            <i class="fas fa-th"></i>
          </button>
          <button class="view-btn" data-view="list" aria-label="Vista en lista">
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>

     <?php
// adaptafcion vista de servicios en turismo.php siu
$sql = "SELECT id, titulo, descripcion, tarifa, duracion, imagenes, categoria, estado 
        FROM servicios 
        WHERE estado='Activo' 
        ORDER BY created_at DESC";
$result = $conn->query($sql);
?>

<div class="products-grid" id="products">
  <?php if ($result->num_rows > 0): ?>
    <?php while($row = $result->fetch_assoc()): ?>
      <?php 
        $imagenes = json_decode($row['imagenes'], true);
        $img = $imagenes[0] ?? "imagenes/default.jpg";
      ?>
      <div class="product-card" 
           data-precio="<?php echo intval($row['tarifa']); ?>" 
           data-rating="5.0" 
           data-disponible="true" 
           data-categoria="<?php echo htmlspecialchars($row['categoria']); ?>">
        <div class="card-image">
          <img src="<?php echo $img; ?>" alt="<?php echo htmlspecialchars($row['titulo']); ?>">
          <div class="availability-badge available">Disponible</div>
        </div>
        <div class="card-content">
          <h4 class="card-title"><?php echo htmlspecialchars($row['titulo']); ?></h4>
          <p><?php echo htmlspecialchars($row['descripcion']); ?></p>
          <div class="card-features">
            <span class="feature-tag"><i class="fas fa-clock"></i> <?php echo $row['duracion']; ?> horas</span>
          </div>
          <div class="card-price">Desde $<?php echo number_format($row['tarifa'],0); ?> COP</div>
          <div class="card-actions">
            <a href="ver_servicio.php?id=<?php echo $row['id']; ?>" class="btn-reserve">
              <i class="fas fa-calendar-check"></i> Reservar ahora
            </a>
            <button class="btn-favorite" aria-label="Agregar a favoritos">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>

      </div>
    <?php endwhile; ?>
  <?php else: ?>
    <p>No hay servicios disponibles en este momento.</p>
  <?php endif; ?>
</div>

  <script src="./script.js"></script>
  <script>
document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  const resultsCount = document.getElementById("results-count");

  searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    products.forEach(function(product) {
      const titulo = product.querySelector(".card-title").textContent.toLowerCase();
      const contenido = product.querySelector(".card-content").textContent.toLowerCase();
      
      if (searchText === "" || titulo.includes(searchText) || contenido.includes(searchText)) {
        product.style.display = "flex";
        visibleCount++;
      } else {
        product.style.display = "none";
      }
    });

    resultsCount.textContent = "Mostrando " + visibleCount + " experiencias";
  });

  console.log("Buscador activado correctamente");
});
</script>

</body>
</html>