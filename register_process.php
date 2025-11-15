<?php
// Conexión a la base de datos
$servername = "db";
$username   = "root";
$password   = "rootpass";
$dbname     = "OceanDB";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Recibir datos del formulario
$username      = $_POST['username'];
$email         = $_POST['email'];
$password      = password_hash($_POST['password'], PASSWORD_DEFAULT);
$fecha_nac     = $_POST['edad'];
$tipo_doc      = $_POST['documento'];
$num_doc       = $_POST['num_documento'];
$telefono      = $_POST['telefono'];

// Insertar en la tabla
$sql = "INSERT INTO usuarios (username, email, password, fecha_nacimiento, tipo_documento, num_documento, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $username, $email, $password, $fecha_nac, $tipo_doc, $num_doc, $telefono);

if ($stmt->execute()) {
    // ✅ Redirigir al login
    header("Location: login.html");
    exit();
} else {
    echo "❌ Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>