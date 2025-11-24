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
  <header>
    <a href="turismo.php">⬅ Volver al inicio</a>
    <?php if ($logged_in): ?>
      <a href="perfil.php">Mi Perfil</a>
    <?php else: ?>
      <a href="login.html">Iniciar Sesión</a>
    <?php endif; ?>
  </header>

  <main class="container service-view">

    <h2><?php echo htmlspecialchars($servicio['titulo']); ?></h2>
    <img src="<?php echo json_decode($servicio['imagenes'])[0] ?? 'imagenes/default.jpg'; ?>" alt="imagen servicio">
    <p><?php echo nl2br(htmlspecialchars($servicio['descripcion'])); ?></p>
    <p><strong>Duración:</strong> <?php echo $servicio['duracion']; ?> horas</p>
    <p><strong>Precio:</strong> $<?php echo number_format($servicio['tarifa'],0); ?> COP</p>
    <p><strong>Horarios:</strong> <?php echo htmlspecialchars($servicio['horarios']); ?></p>
    <p><strong>Edad mínima:</strong> <?php echo $servicio['edad_minima']; ?></p>
    <p><strong>Capacidad:</strong> <?php echo $servicio['capacidad']; ?></p>
    <p><strong>Incluye:</strong> <?php echo nl2br(htmlspecialchars($servicio['incluye'])); ?></p>
    <p><strong>Notas:</strong> <?php echo nl2br(htmlspecialchars($servicio['notas'])); ?></p>

    <!-- Botón de reserva -->
    <?php if ($logged_in): ?>
      <form action="reservar.php" method="POST">
        <input type="hidden" name="servicio_id" value="<?php echo $servicio['id']; ?>">
        <label>Cantidad de personas:</label>
        <input type="number" name="cantidad" value="1" min="1" required>
        <button type="submit" class="btn">Confirmar Reserva</button>
      </form>
    <?php else: ?>
      <p>⚠️ Debes <a href="login.html">iniciar sesión</a> para reservar.</p>
    <?php endif; ?>
  
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
  </main>

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

<div class="reviews-list section">
  <h3>Reseñas recientes</h3>
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



</body>
</html>