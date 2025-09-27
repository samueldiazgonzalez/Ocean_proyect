<?php
include 'db.php';

$nombre = $_POST['username'];
$correo = $_POST['email'];
$pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO Usuarios (nombre, correo, contraseña, notificaciones) 
VALUES (?, ?, ?, 1)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $nombre, $correo, $pass);

if ($stmt->execute()) {
    echo "Registro exitoso.  href='login.html'>Iniciar sesión</a>";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>