<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("Error DB: " . $conn->connect_error);
}

$usuario_id  = $_SESSION['user_id'];
$servicio_id = isset($_POST['servicio_id']) ? (int)$_POST['servicio_id'] : 0;
$cantidad    = isset($_POST['cantidad']) ? (int)$_POST['cantidad'] : 1;

if ($servicio_id <= 0 || $cantidad <= 0) {
    die("❌ Datos de reserva inválidos.");
}

// Obtener tarifa y capacidad del servicio
$sql = "SELECT tarifa, capacidad, estado FROM servicios WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $servicio_id);
$stmt->execute();
$result = $stmt->get_result();
$servicio = $result->fetch_assoc();

if (!$servicio || $servicio['estado'] !== 'Activo') {
    die("❌ Servicio no disponible.");
}

$tarifa = (float)$servicio['tarifa'];
if ($tarifa <= 0) die("❌ Tarifa inválida.");

// Validar capacidad
if (!empty($servicio['capacidad']) && $cantidad > (int)$servicio['capacidad']) {
    die("❌ Cantidad excede la capacidad disponible.");
}

// Calcular total
$total = $tarifa * $cantidad;

// Insertar reserva (fecha_reserva y estado se ponen por defecto)
$sql = "INSERT INTO reservas (usuario_id, servicio_id, cantidad, total) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiid", $usuario_id, $servicio_id, $cantidad, $total);

if ($stmt->execute()) {
    header("Location: mis_reservas.php?ok=1");
    exit();
} else {
    echo "❌ Error al reservar: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>