<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("❌ Error DB: " . $conn->connect_error);

$user_id = $_SESSION['user_id'];
$reserva_id = $_POST['reserva_id'] ?? null;

if ($reserva_id) {
    // Eliminar la reserva de la base de datos
    $sql = "DELETE FROM reservas WHERE id = ? AND usuario_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $reserva_id, $user_id);
    if ($stmt->execute()) {
        header("Location: mis_reservas.php?delete_ok=1");
        exit();
    } else {
        echo "❌ Error al eliminar la reserva.";
    }
    $stmt->close();
}

$conn->close();
?>