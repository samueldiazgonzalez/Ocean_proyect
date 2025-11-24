<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$user_id = $_SESSION['user_id'];

$sql = "SELECT r.comentario, r.rating, r.created_at, s.titulo 
        FROM reseñas r
        JOIN servicios s ON r.servicio_id = s.id
        WHERE r.usuario_id = ?
        ORDER BY r.created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mis Reseñas</title>
  <link rel="stylesheet" href="perfil.css">
</head>
<body>
  <section class="card big-card">
    <h2>📝 Todas mis reseñas</h2>
    <?php if ($result->num_rows > 0): ?>
      <?php while($row = $result->fetch_assoc()): ?>
        <div class="review">
          <strong><?php echo htmlspecialchars($row['titulo']); ?></strong><br>
          <span><?php echo str_repeat("⭐", $row['rating']); ?></span><br>
          <p><?php echo htmlspecialchars($row['comentario']); ?></p>
          <small><?php echo $row['created_at']; ?></small>
        </div>
        <hr>
      <?php endwhile; ?>
    <?php else: ?>
      <p>No has publicado reseñas aún.</p>
    <?php endif; ?>
    <a href="perfil.php" class="btn-secondary">⬅ Volver al perfil</a>
  </section>
</body>
</html>