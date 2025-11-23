<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$user_id   = $_SESSION['user_id'];
$destino_id = $_POST['destino_id'];
$comentario = trim($_POST['comentario']);
$rating     = intval($_POST['rating']);

// Validar destino
$sql = "SELECT id FROM destinos WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $destino_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    die("❌ Error: El destino no existe.");
}

// Insertar reseña
$stmt = $conn->prepare("INSERT INTO reseñas (usuario_id, destino_id, comentario, rating) VALUES (?,?,?,?)");
$stmt->bind_param("iisi", $user_id, $destino_id, $comentario, $rating);
$stmt->execute();

header("Location: perfil.php"); // vuelve a la vista
exit();
?>