<?php
session_start();
$logged_in = isset($_SESSION['user_id']);

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$id = $_GET['id'] ?? null;
if (!$id) die("❌ Servicio no especificado.");

$sql = "SELECT * FROM servicios WHERE id=? AND estado='Activo'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$servicio = $result->fetch_assoc();
if (!$servicio) die("❌ Servicio no encontrado.");
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title><?php echo htmlspecialchars($servicio['titulo']); ?></title>
  <link rel="stylesheet" href="Vistas_estilo.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
  <!-- HEADER -->
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
        <div class="logo"><i class="fas fa-compass"></i> OCEAN</div>
        <nav class="main-nav">
          <a href="turismo.php"><i class="fas fa-home"></i> Inicio</a>
          <a href="mis_reservas.php"><i class="fas fa-bookmark"></i> Mis Reservas</a>
          <?php if ($logged_in): ?>
            <a href="perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
          <?php else: ?>
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Iniciar Sesión</a>
          <?php endif; ?>
        </nav>
      </div>
    </div>
  </header>

  <!-- CONTENIDO PRINCIPAL -->
  <div class="container grid">
    <div class="gallery-reserve-wrapper">
      <!-- Imagen principal -->
      <main class="gallery-section">
        <section class="gallery">
          <div class="hero">
            <img src="<?php echo json_decode($servicio['imagenes'])[0] ?? 'imagenes/default.jpg'; ?>" 
                 alt="<?php echo htmlspecialchars($servicio['titulo']); ?>" class="hero-img" />
            <div class="hero-text"><?php echo htmlspecialchars($servicio['titulo']); ?></div>
          </div>
        </section>
      </main>

      <!-- Sidebar de reserva -->
      <aside class="reserve-sidebar">
        <div class="card">
          <div class="price-section">
            <div>
              <div class="price">$<?php echo number_format($servicio['tarifa'],0); ?> COP</div>
              <div class="per-night">por servicio</div>
            </div>
            <div class="rating-info">⭐ 5.0 · Nuevo</div>
          </div>

          <?php if ($logged_in): ?>
          <form action="reservar.php" method="POST" class="reserve-form">
            <input type="hidden" name="servicio_id" value="<?php echo $servicio['id']; ?>">
            <label>Cantidad de personas</label>
            <input type="number" name="cantidad" value="1" min="1" required>
            <button type="submit" class="book-btn">
              <i class="fas fa-calendar-check"></i> Reservar ahora
            </button>
          </form>
          <?php else: ?>
            <p>⚠️ Debes <a href="login.html">iniciar sesión</a> para reservar.</p>
          <?php endif; ?>
        </div>
      </aside>
    </div>

    <!-- Secciones de información -->
    <main class="info-section-wrapper">
      <section class="section">
        <h3>Descripción</h3>
        <p><?php echo nl2br(htmlspecialchars($servicio['descripcion'])); ?></p>
      </section>

      <section class="section">
        <h3>Incluye</h3>
        <p><?php echo nl2br(htmlspecialchars($servicio['incluye'])); ?></p>
      </section>

      <section class="section">
        <h3>Notas adicionales</h3>
        <p><?php echo nl2br(htmlspecialchars($servicio['notas'])); ?></p>
      </section>
    </main>
  </div>
  
</body>
</html>