<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$user_id     = $_SESSION['user_id'];
$servicio_id = isset($_POST['servicio_id']) ? (int)$_POST['servicio_id'] : 0;
$comentario  = trim($_POST['comentario']);
$rating      = intval($_POST['rating']);

if ($servicio_id <= 0) {
    die("❌ Error: Servicio no especificado.");
}

// Validar que el servicio exista
$sql = "SELECT id FROM servicios WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $servicio_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    die("❌ Error: El servicio no existe.");
}
$stmt->close();

// Insertar reseñ

$sql = "INSERT INTO reseñas (usuario_id, servicio_id, comentario, rating) VALUES (?,?,?,?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iisi", $user_id, $servicio_id, $comentario, $rating);

if ($stmt->execute()) {
    header("Location: perfil.php?reseña=ok");
    exit();
} else {
    echo "❌ Error al guardar reseña: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>