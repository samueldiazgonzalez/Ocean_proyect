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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="Vistas_estilo.css" />
</head>
<body>
  <!-- HEADER -->
  <header class="header-main">
    <div class="container">
      <a href="turismo.php">⬅ Volver al inicio</a>
      <?php if ($logged_in): ?>
        <a href="perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
      <?php else: ?>
        <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Iniciar Sesión</a>
      <?php endif; ?>
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
            <div class="rating-info">⭐ Nuevo</div>
          </div>

          <?php if ($logged_in): ?>
         <form action="reservar.php" method="POST" class="reserve-form">
  <input type="hidden" name="servicio_id" value="<?php echo $servicio['id']; ?>">
  <label>Cantidad de personas:</label>
  <input type="number" name="cantidad" value="1" min="1" max="<?php echo (int)$servicio['capacidad']; ?>" required>
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

      <!-- Reseñas -->
      <section class="section review-section">
        <h3>Opiniones y Valoraciones</h3>
        <?php if ($logged_in): ?>
        <form action="reseñar.php" method="POST" class="review-form">
          <input type="hidden" name="servicio_id" value="<?php echo $servicio['id']; ?>">
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
        <?php else: ?>
          <p>⚠️ Debes <a href="login.html">iniciar sesión</a> para dejar una reseña.</p>
        <?php endif; ?>

        <?php
        $sql = "SELECT u.username, r.comentario, r.rating, r.created_at
                FROM reseñas r
                JOIN usuarios u ON r.usuario_id = u.id
                WHERE r.servicio_id = ?
                ORDER BY r.created_at DESC
                LIMIT 10";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $servicio['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        ?>
        <div class="reviews-list">
          <h4>Reseñas recientes</h4>
          <?php if ($result->num_rows > 0): ?>
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
          <?php else: ?>
            <p>No hay reseñas aún. Sé el primero en comentar.</p>
          <?php endif; ?>
        </div>
      </section>
    </main>
  </div>
</body>
</html>