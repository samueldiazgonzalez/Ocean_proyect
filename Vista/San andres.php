<?php
session_start();
$logged_in = isset($_SESSION['user_id']);
?>

<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Escapada a San Andrés</title>

  <!-- Estilos -->
  <link rel="stylesheet" href="vistas_estilo.css" />

  <!-- Iconos Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>
  <!-- ===========================
       ENCABEZADO PRINCIPAL
  ============================ -->
  <header class="header">
    <div class="header-top">
      <div class="container">
        <div class="contact-info">
          <span><i class="fas fa-phone"></i> +57 300 123 4567</span>
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
          <i class="fas fa-compass"></i> OCEAN
        </div>
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="search" class="search-input" placeholder="Buscar destinos, tours, hospedajes...">
        </div>
   <nav class="main-nav">
  <a href="../turismo.php"><i class="fas fa-home"></i> Inicio</a>
  <a href="#"><i class="fas fa-map"></i> Explorar</a>
  <a href="#"><i class="fas fa-bookmark"></i> Mis Reservas</a>
  <a href="#"><i class="fas fa-tags"></i> Ofertas</a>
  <a href="#"><i class="fas fa-question-circle"></i> Ayuda</a>

  <?php if ($logged_in): ?>
    <a href="../perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
    <a href="../logout.php" class="btn-register"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
  <?php else: ?>
    <a href="../login.html" class="btn-login"><i class="fas fa-user"></i> Iniciar Sesión</a>
    <a href="../roles.html" class="btn-register"><i class="fas fa-user-plus"></i> Regístrate</a>
  <?php endif; ?>
</nav>
      </div>
    </div>
  </header>

  <!-- ===========================
       CONTENIDO PRINCIPAL
  ============================ -->
  <div class="container">
    <div class="grid">
      <!-- GALERÍA Y RESERVA EN FILA -->
      <div class="gallery-reserve-wrapper">
        <main class="gallery-section">
          <!-- GALERÍA -->
          <section class="gallery">
            <div class="hero">
              <img src="../imagenes/decameron-aquarium.jpg" 
                   alt="Playa tropical" class="hero-img" />
              <div class="hero-text">Explora tu próximo destino </div>
            </div>

            <div class="thumbs">
              <div class="thumb" data-info="Playas paradisíacas y aguas cristalinas">
                <i class="fas fa-image"></i>
                <span>Playas</span>
              </div>
              <div class="thumb" data-info="Senderismo y vistas impresionantes">
                <i class="fas fa-image"></i>
                <span>Montañas</span>
              </div>
              <div class="thumb" data-info="Vida nocturna y cultura local">
                <i class="fas fa-image"></i>
                <span>Ciudades</span>
              </div>
              <div class="thumb" data-info="Aventura y naturaleza">
                <i class="fas fa-image"></i>
                <span>Selvas</span>
              </div>
            </div>
          </section>
        </main>

        <!-- SIDEBAR DE RESERVA -->
        <aside class="reserve-sidebar">
          <div class="card">
            <div class="price-section">
              <div>
                <div class="price" id="pricePerNight" data-price="180000"> $180.000 COP</div>
                <div class="per-night">por noche</div>
              </div>
              <div class="rating-info">⭐ 4.9 · 320 reseñas</div>
            </div>

          <form action="../reservar.php" method="POST" class="reserve-form">
  <input type="hidden" name="destino_id" value="2"> <!-- ID del destino en la tabla destinos -->

  <div class="dates">
    <label>Fechas</label>
    <div class="date-inputs">
      <input type="date" name="checkin" required />
      <input type="date" name="checkout" required />
    </div>
  </div>

  <div class="guests">
    <label>Huéspedes</label>
    <select name="huespedes" required>
      <option value="1">1 huésped</option>
      <option value="2">2 huéspedes</option>
      <option value="3">3 huéspedes</option>
      <option value="4">4 huéspedes</option>
    </select>
  </div>

  <div class="total-row">
    <div>Total estimado:</div>
    <div class="total" id="totalPrice">$0 COP</div>
  </div>

  <div class="fees">
    <p> Tarifa de limpieza: $50.000 COP</p>
    <p> Servicio Airbnb: $30.000 COP</p>
    <p> Impuestos: 19%</p>
  </div>

  <button type="submit" class="book-btn">
    <i class="fas fa-calendar-check"></i> Reservar ahora
  </button>
</form>


            <div class="info">
              <p>Incluye asesoría turística y comparativa de precios.</p>
              <p class="policy">Cancelación gratuita hasta 5 días antes del check-in.</p>
            </div>
          </div>
        </aside>
      </div>

      <form action="../favorito.php" method="POST" class="favorite-form">
  <input type="hidden" name="destino_id" value="1"> <!-- ID real del destino -->
  <button type="submit" class="favorite-btn">
    ❤️ Guardar en Favoritos
  </button>
</form>


      <!-- RESTO DEL CONTENIDO -->
      <main class="info-section-wrapper">
        <!-- INFORMACIÓN -->
        <section class="info-section">
          <div class="title-row">
            <div>
              <h2 class="title">Cabaña tropical en Cartagena</h2>
              <div class="meta">Hasta 4 huéspedes · 2 habitaciones · 3 camas · Cerca de la playa</div>
            </div>
            <div class="rating">⭐ <strong>4.9</strong> · 320 reseñas</div>
          </div>

          <!-- ANFITRIÓN -->
          <div class="host">
            <img src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=60" 
                 alt="Anfitrión" class="avatar-img" />
            <div>
              <div class="host-name">Anfitriones: Camila & Juan</div>
              <div class="host-sub">Guías locales · desde 2019</div>
            </div>
            <div style="margin-left:auto">
              <span class="pill">Tours personalizados</span>
            </div>
          </div>

          <!-- DESCRIPCIÓN -->
          <div class="section">
            <h3>Descripción general</h3>
            <p id="mainDescription">
              Inspirado en el estilo Trivago, esta cabaña combina comodidad, ubicación estratégica y una experiencia inmersiva en la cultura caribeña.
            </p>
            <button id="expandDesc" class="link-btn">Mostrar más</button>
            <div id="extraDesc" class="hidden">
              <p>
                Incluye comparativa de precios, sugerencias de viajeros y recomendaciones locales. Vive el encanto del Caribe con tranquilidad y estilo.
              </p>
            </div>
          </div>

          <!-- TOURS -->
          <div class="section">
            <h3>Servicios turísticos y tours adicionales</h3>
            <div class="tours-grid">
              <div class="tour-card">
                <i class="fas fa-image tour-placeholder"></i>
                <div class="tour-info">
                  <h4>Tour en lancha por Islas del Rosario</h4>
                  <p>Incluye almuerzo típico, snorkeling y bebidas.</p>
                  <span class="price">Desde $150.000 COP</span>
                </div>
              </div>

              <div class="tour-card">
                <i class="fas fa-image tour-placeholder"></i>
                <div class="tour-info">
                  <h4>Tour gastronómico local</h4>
                  <p>Descubre los sabores caribeños en un recorrido por los mejores restaurantes.</p>
                  <span class="price">Desde $120.000 COP</span>
                </div>
              </div>

              <div class="tour-card">
                <i class="fas fa-image tour-placeholder"></i>
                <div class="tour-info">
                  <h4>Caminata ecológica</h4>
                  <p>Con guía local, avistamiento de aves y picnic incluido.</p>
                  <span class="price">Desde $90.000 COP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- UBICACIÓN -->
          <div class="section">
            <h3>Ubicación</h3>
            <p>
              En el barrio Bocagrande — cerca de playas, restaurantes y puntos turísticos. Perfecta para explorar el centro histórico y las islas cercanas.
            </p>
            <div class="map-placeholder">
              <img src="https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80" alt="Mapa turístico" />
            </div>
          </div>

          <!-- COMENTARIOS -->
            <section class="section review-section">
            <h3>Opiniones y Valoraciones</h3>
            <div class="rating-box">
              <p>Tu valoración:</p>
              <div class="stars" id="starRating">
                <span data-value="1">&#9733;</span>
                <span data-value="2">&#9733;</span>
                <span data-value="3">&#9733;</span>
                <span data-value="4">&#9733;</span>
                <span data-value="5">&#9733;</span>
              </div>
            </div>

     <form action="../reseñar.php" method="POST" class="review-form">
  <input type="hidden" name="destino_id" value="4"> <!-- ID del destino en la tabla destinos -->

  <div class="rating-box">
    <p>Tu valoración:</p>
    <select name="rating" required>
      <option value="1">⭐</option>
      <option value="2">⭐⭐</option>
      <option value="3">⭐⭐⭐</option>
      <option value="4">⭐⭐⭐⭐</option>
      <option value="5">⭐⭐⭐⭐⭐</option>
    </select>
  </div>

  <textarea name="comentario" maxlength="250" placeholder="Escribe tu experiencia..." required></textarea>

  <button type="submit" class="book-btn">Publicar reseña</button>
</form>

         <?php
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$sql = "SELECT u.username, r.comentario, r.rating, r.created_at
        FROM reseñas r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.destino_id=4
        ORDER BY r.created_at DESC
        LIMIT 10";
$result = $conn->query($sql);
?>

<div class="reviews-list">
  <h4>Reseñas recientes</h4>
  <?php while($row = $result->fetch_assoc()): ?>
    <div class="review">
      <div class="review-header">
        <img src="https://i.pravatar.cc/50?u=<?php echo $row['username']; ?>" alt="avatar" class="review-avatar">
        <div>
          <strong><?php echo htmlspecialchars($row['username']); ?></strong>
          <div class="review-stars"><?php echo str_repeat("⭐", $row['rating']); ?></div>
        </div>
      </div>
      <p><?php echo htmlspecialchars($row['comentario']); ?></p>
    </div>
  <?php endwhile; ?>
</div>


  <!-- TOAST -->
  <div id="toast" class="toast hidden"></div>

  <!-- Script principal -->
  <script src="funcionalidades.js"></script>
</body>
</html>
