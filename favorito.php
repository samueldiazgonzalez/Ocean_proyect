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

// Insertar favorito (si no existe)
$stmt = $conn->prepare("INSERT IGNORE INTO favoritos (usuario_id, destino_id) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $destino_id);
$stmt->execute();

header("Location: perfil.php"); // redirige al perfil para ver favoritos
exit();
?>