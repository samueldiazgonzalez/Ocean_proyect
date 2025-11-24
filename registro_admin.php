<?php
session_start();
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("❌ Error DB: " . $conn->connect_error);

$nombre   = $_POST['nombre'];
$correo   = $_POST['correo'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO administradores (nombre, correo, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nombre, $correo, $password);

if ($stmt->execute()) {
    echo "✅ Administrador registrado correctamente.";
} else {
    echo "❌ Error: " . $conn->error;
}

$stmt->close();
$conn->close();
?>