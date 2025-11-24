<?php
session_start();
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("❌ Error DB: " . $conn->connect_error);

$correo   = $_POST['correo'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, nombre, password, rol FROM administradores WHERE correo=?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        $_SESSION['admin_id'] = $row['id'];
        $_SESSION['admin_nombre'] = $row['nombre'];
        $_SESSION['admin_rol'] = $row['rol'];

        header("Location: Admin.html"); // redirige al panel
        exit();
    } else {
        echo "❌ Contraseña incorrecta.";
    }
} else {
    echo "❌ Administrador no encontrado.";
}

$stmt->close();
$conn->close();
?>