<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("❌ Conexión fallida: " . $conn->connect_error);

$proveedor_id = $_SESSION['proveedor_id'];

$sql = "SELECT u.username AS cliente,
               s.titulo AS servicio,
               r.fecha_reserva,
               r.cantidad,
               r.total,
               r.estado AS estado_reserva,
               re.comentario,
               re.rating,
               re.created_at AS fecha_resena
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN servicios s ON r.servicio_id = s.id
        LEFT JOIN reseñas re ON re.usuario_id = r.usuario_id AND re.servicio_id = r.servicio_id
        WHERE s.proveedor_id = ?
        ORDER BY r.fecha_reserva DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $proveedor_id);
$stmt->execute();
$resultado = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Clientes de mis servicios</title>
  <link rel="stylesheet" href="clientes.css">
  <style>
    .sin-resena { color: #999; font-style: italic; }
    .con-resena { background-color: #f0f8ff; }
    .estado-badge {
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.85em;
      font-weight: bold;
    }
    .estado-pendiente { background-color: #fff3cd; color: #856404; }
    .estado-confirmada { background-color: #d4edda; color: #155724; }
    .estado-cancelada { background-color: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Clientes de mis servicios</h1>
    <a href="proveedor.html" class="btn-back">⟵ Regresar</a>
    
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Fecha Reserva</th>
          <th>Personas</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Comentario</th>
          <th>Valoración</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($resultado->num_rows > 0): ?>
          <?php while($row = $resultado->fetch_assoc()): ?>
            <tr class="<?php echo $row['comentario'] ? 'con-resena' : ''; ?>">
              <td><?php echo htmlspecialchars($row['cliente']); ?></td>
              <td><?php echo htmlspecialchars($row['servicio']); ?></td>
              <td><?php echo date('d/m/Y H:i', strtotime($row['fecha_reserva'])); ?></td>
              <td><?php echo $row['cantidad']; ?></td>
              <td>$<?php echo number_format($row['total'], 2); ?></td>
              <td>
                <span class="estado-badge estado-<?php echo $row['estado_reserva']; ?>">
                  <?php echo ucfirst($row['estado_reserva']); ?>
                </span>
              </td>
              <td class="<?php echo !$row['comentario'] ? 'sin-resena' : ''; ?>">
                <?php 
                if ($row['comentario']) {
                  echo htmlspecialchars($row['comentario']);
                  if ($row['fecha_resena']) {
                    echo '<br><small>(' . date('d/m/Y', strtotime($row['fecha_resena'])) . ')</small>';
                  }
                } else {
                  echo 'Sin reseña aún';
                }
                ?>
              </td>
              <td>
                <?php echo $row['rating'] ? str_repeat("⭐", (int)$row['rating']) : '—'; ?>
              </td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr>
            <td colspan="8" style="text-align: center; padding: 20px;">
              No hay reservas para tus servicios aún.
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
<?php
$stmt->close();
$conn->close();
?>