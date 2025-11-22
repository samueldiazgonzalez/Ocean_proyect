<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("❌ Conexión fallida: " . $conn->connect_error);
}

$user_id = $_SESSION['user_id'];
$sql = "DELETE FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

session_unset();
session_destroy();

header("Location: turismo.php");
exit();
?>