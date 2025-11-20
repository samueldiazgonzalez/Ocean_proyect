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
  <script src="script.js"></script>
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
          <a href="#"><i class="fab fa-facebook"></i></a>
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
  <a href="#"><i class="fas fa-home"></i> Inicio</a>
  <a href="#"><i class="fas fa-map"></i> Explorar</a>
  <a href="#"><i class="fas fa-bookmark"></i> Mis Reservas</a>
  <a href="#"><i class="fas fa-tags"></i> Ofertas</a>
  <a href="#"><i class="fas fa-question-circle"></i> Ayuda</a>

  <?php if ($logged_in): ?>
    <a href="perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
    <a href="logout.php" class="btn-register"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
  <?php else: ?>
    <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Iniciar Sesión</a>
    <a href="roles.html" class="btn-register"><i class="fas fa-user-plus"></i> Regístrate</a>
  <?php endif; ?>
</nav>
      </div>
    </div>
  </header>

  
  <section class="hero-banner" style="background-image: linear-gradient(135deg, rgba(0, 102, 204, 0.8), rgba(0, 180, 216, 0.7)), url('imagenes/iStock-1165965255%20copia.webp'); background-size: cover; background-position: center;">
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

      <div class="products-grid" id="products">
        <div class="product-card" data-precio="95000" data-rating="4.9" data-disponible="true" data-categoria="Tours de aventura">
          <div class="card-image">
            <img src="imagenes/Cartagena_Colombia.webp" alt="Tour histórico en Cartagena de Indias, Colombia">
            <div class="availability-badge available">Disponible</div>
            <div class="card-badge">Destacado</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Tour por Cartagena histórica</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <span class="rating-number">4.9 (127 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-clock"></i> 6 horas</span>
              <span class="feature-tag"><i class="fas fa-users"></i> Grupo pequeño</span>
              <span class="feature-tag"><i class="fas fa-camera"></i> Fotos incluidas</span>
            </div>
            <div class="card-price">Desde $95,000 COP</div>
            <div class="card-actions">
              <button class="btn-reserve">
                <a href="vista/Cartagena.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card" data-precio="180000" data-rating="4.7" data-disponible="false" data-categoria="Playas">
          <div class="card-image">
            <img src="imagenes/parque-nacional-tayrona-colombia-2024-1.jpg" alt="Escapada a San Andrés, Colombia">
            <div class="availability-badge unavailable">Agotado</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Escapada a San Andrés</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="far fa-star"></i>
              </div>
              <span class="rating-number">4.7 (89 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-plane"></i> Vuelos incluidos</span>
              <span class="feature-tag"><i class="fas fa-bed"></i> 3 noches</span>
              <span class="feature-tag"><i class="fas fa-umbrella-beach"></i> Todo incluido</span>
            </div>
            <div class="card-price">Desde $180,000 COP</div>
            <div class="card-actions">
             <button class="btn-reserve">
                <a href="vista/San andres.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card" data-precio="70000" data-rating="4.8" data-disponible="true" data-categoria="Guías locales">
          <div class="card-image">
            <img src="imagenes/images.jpeg" alt="Guía local en Parque Tayrona, Colombia">
            <div class="availability-badge available">Disponible</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Guía local en Parque Tayrona</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <span class="rating-number">4.8 (95 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-hiking"></i> Senderismo</span>
              <span class="feature-tag"><i class="fas fa-leaf"></i> Naturaleza</span>
              <span class="feature-tag"><i class="fas fa-map"></i> Guía experto</span>
            </div>
            <div class="card-price">Desde $70,000 COP</div>
            <div class="card-actions">
              <button class="btn-reserve">
                <a href="vista/Tayrona.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card" data-precio="120000" data-rating="4.6" data-disponible="true" data-categoria="Tours de aventura">
          <div class="card-image">
            <img src="imagenes/29SANTAMARTA_1.jpg" alt="Aventura en Santa Marta, Colombia">
            <div class="availability-badge available">Disponible</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Aventura en Santa Marta</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
              </div>
              <span class="rating-number">4.6 (73 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-mountain"></i> Sierra Nevada</span>
              <span class="feature-tag"><i class="fas fa-water"></i> Playas</span>
              <span class="feature-tag"><i class="fas fa-camera"></i> Tour fotográfico</span>
            </div>
            <div class="card-price">Desde $120,000 COP</div>
            <div class="card-actions">
               <button class="btn-reserve">
                <a href="vista/Santa marta.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card" data-precio="150000" data-rating="4.5" data-disponible="false" data-categoria="Paquetes completos">
          <div class="card-image">
            <img src="imagenes/parque-flamingos-camarones-guajira-colombia-5-©-Tristan-Quevilly-400x300.jpg.webp" alt="Tour desierto La Guajira, Colombia">
            <div class="availability-badge unavailable">Agotado</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Tour desierto La Guajira</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
              </div>
              <span class="rating-number">4.5 (112 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-sun"></i> Desierto</span>
              <span class="feature-tag"><i class="fas fa-bed"></i> 2 noches</span>
              <span class="feature-tag"><i class="fas fa-users"></i> Grupo pequeño</span>
            </div>
            <div class="card-price">Desde $150,000 COP</div>
            <div class="card-actions">
             <button class="btn-reserve">
                <a href="vista/Guajira.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card" data-precio="250000" data-rating="5.0" data-disponible="true" data-categoria="Tours de aventura">
          <div class="card-image">
            <img src="imagenes/viajescomfama-amazonas-01.jpg" alt="Expedición en el Amazonas, Colombia">
            <div class="availability-badge available">Disponible</div>
            <div class="card-badge">Premium</div>
          </div>
          <div class="card-content">
            <h4 class="card-title">Expedición al Amazonas</h4>
            <div class="card-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <span class="rating-number">5.0 (45 reseñas)</span>
            </div>
            <div class="card-features">
              <span class="feature-tag"><i class="fas fa-tree"></i> Selva</span>
              <span class="feature-tag"><i class="fas fa-ship"></i> Paseo en bote</span>
              <span class="feature-tag"><i class="fas fa-binoculars"></i> Avistamiento</span>
            </div>
            <div class="card-price">Desde $250,000 COP</div>
            <div class="card-actions">
            <button class="btn-reserve">
                <a href="vista/Amazonas.php" class="btn-reserve">
                 <i class="fas fa-calendar-check"></i> Reservar ahora</a>         
                 </button>
              <button class="btn-favorite" aria-label="Agregar a favoritos">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
