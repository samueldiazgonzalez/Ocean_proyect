<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$user_id = $_SESSION['user_id'];

// Consultar reservas del usuario con datos del servicio
$sql = "SELECT r.id, r.fecha_reserva, r.cantidad, r.total, r.estado,
               s.titulo, s.descripcion, s.tarifa
        FROM reservas r
        JOIN servicios s ON r.servicio_id = s.id
        WHERE r.usuario_id = ?
        ORDER BY r.fecha_reserva DESC";
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
  <link rel="stylesheet" href="Vistas_estilo.css">
</head>
<body>
  <header class="header-main">
    <div class="container">
      <a href="turismo.php"><i class="fas fa-home"></i> Inicio</a>
      <a href="mis_reservas.php"><i class="fas fa-bookmark"></i> Mis Reservas</a>
      <a href="perfil.php" class="btn-login"><i class="fas fa-user"></i> Mi Perfil</a>
    </div>
  </header>

  <section class="card big-card">
    <h2>📅 Mis Reservas</h2>

    <?php if (isset($_GET['ok'])): ?>
      <div class="toast show">✅ Reserva creada correctamente</div>
    <?php endif; ?>

    <?php if ($result->num_rows > 0): ?>
      <?php while($row = $result->fetch_assoc()): ?>
        <div class="reserva section">
          <strong><?php echo htmlspecialchars($row['titulo']); ?></strong><br>
          <p><?php echo htmlspecialchars($row['descripcion']); ?></p>
          <p><strong>Fecha de reserva:</strong> <?php echo $row['fecha_reserva']; ?></p>
          <p><strong>Cantidad:</strong> <?php echo (int)$row['cantidad']; ?> personas</p>
          <p><strong>Total:</strong> $<?php echo number_format($row['total'], 0); ?> COP</p>
          <p><strong>Estado:</strong> <?php echo ucfirst($row['estado']); ?></p>

          <?php if ($row['estado'] === 'pendiente'): ?>
            <form action="pago.php" method="POST">
              <input type="hidden" name="reserva_id" value="<?php echo $row['id']; ?>">
              <button type="submit" class="book-btn">💳 Proceder al pago</button>
            </form>
          <?php endif; ?>
        </div>
      <?php endwhile; ?>
    <?php else: ?>
      <p>No tienes reservas aún.</p>
    <?php endif; ?>

    <a href="turismo.php" class="btn-login">⬅ Volver a explorar</a>
  </section>
</body>
</html>