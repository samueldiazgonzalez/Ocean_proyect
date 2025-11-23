<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$user_id = $_SESSION['user_id'];

// Consultar reservas del usuario
$sql = "SELECT r.id, r.fecha_checkin, r.fecha_checkout, r.huespedes, r.total, r.estado, d.titulo, d.ubicacion, d.precio
        FROM reservas r
        JOIN destinos d ON r.destino_id = d.id
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
  <title>Mis Reservas</title>
  <link rel="stylesheet" href="perfil.css">
</head>
<body>
  <section class="card big-card">
    <h2>📅 Mis Reservas</h2>
    <?php while($row = $result->fetch_assoc()): ?>
  <div class="reserva">
    <strong><?php echo htmlspecialchars($row['titulo']); ?></strong><br>
    <span><?php echo htmlspecialchars($row['ubicacion']); ?></span><br>
    <p><strong>Check-in:</strong> <?php echo $row['fecha_checkin']; ?></p>
    <p><strong>Check-out:</strong> <?php echo $row['fecha_checkout']; ?></p>
    <p><strong>Huéspedes:</strong> <?php echo $row['huespedes']; ?></p>
    <p><strong>Total:</strong> $<?php echo number_format($row['total'], 2); ?> COP</p>
    <p><strong>Estado:</strong> <?php echo ucfirst($row['estado']); ?></p>

    <!-- Botón de pago -->
    <?php if ($row['estado'] === 'pendiente'): ?>
      <form action="pago.php" method="POST">
        <input type="hidden" name="reserva_id" value="<?php echo $row['id']; ?>">
        <button type="submit" class="btn-secondary">💳 Proceder al pago</button>
      </form>
          <?php else: ?>
      <p>No tienes reservas aún.</p>
    <?php endif; ?>
  </div>
  <hr>
<?php endwhile; ?>

   

  <a href="perfil.php" class="btn-secondary">⬅ Volver al perfil</a>
  </section>
</body>
</html>