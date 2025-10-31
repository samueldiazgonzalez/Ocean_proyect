<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db.php';

$nombre = $_POST['username'];
$correo = $_POST['email'];
$pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO Usuarios (nombre, correo, contrasena, notificaciones)
        VALUES (?, ?, ?, 1)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $nombre, $correo, $pass);

if ($stmt->execute()) {
echo "Registro exitoso. <a href='login.html'>Iniciar sesión</a>";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>