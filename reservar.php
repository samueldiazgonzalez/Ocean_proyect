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

$user_id   = $_SESSION['user_id'];
$destino_id = $_POST['destino_id'];
$checkin   = $_POST['checkin'];
$checkout  = $_POST['checkout'];
$huespedes = $_POST['huespedes'];

// Calcular noches
$nights = (strtotime($checkout) - strtotime($checkin)) / (60*60*24);

// Obtener precio del destino
$sql = "SELECT precio FROM destinos WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $destino_id);
$stmt->execute();
$result = $stmt->get_result();
$destino = $result->fetch_assoc();

$total = $nights * $destino['precio'] * $huespedes;

// Insertar reserva
$stmt = $conn->prepare("INSERT INTO reservas (usuario_id, destino_id, fecha_checkin, fecha_checkout, huespedes, total) VALUES (?,?,?,?,?,?)");
$stmt->bind_param("iissid", $user_id, $destino_id, $checkin, $checkout, $huespedes, $total);
$stmt->execute();

header("Location: perfil.php"); // redirige al perfil para ver reservas
exit();
?>
