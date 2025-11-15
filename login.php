<?php
session_start();

// Conexión a la base
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("❌ Conexión fallida: " . $conn->connect_error);
}

$user = $_POST['username'];
$pass = $_POST['password'];

$sql = "SELECT id, username, password FROM usuarios WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($pass, $row['password'])) {
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['username'] = $row['username'];

        // ✅ Redirigir al home
        header("Location: turismo.php");
        exit();
    } else {
        echo "❌ Contraseña incorrecta.";
    }
} else {
    echo "❌ Usuario no encontrado.";
}

$stmt->close();
$conn->close();
?>