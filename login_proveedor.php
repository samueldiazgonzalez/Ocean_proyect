<?php
session_start();
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("❌ Error DB: " . $conn->connect_error);

$correo   = $_POST['correo'];
$password = $_POST['password'];

// Buscar proveedor por correo
$stmt = $conn->prepare("SELECT id, empresa, password FROM proveedores WHERE correo=?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    // Verificar contraseña
    if (password_verify($password, $row['password'])) {
        $_SESSION['proveedor_id'] = $row['id'];
        $_SESSION['empresa'] = $row['empresa'];

        header("Location: perfil_proveedor.php"); // redirige al panel
        exit();
    } else {
        echo "❌ Contraseña incorrecta.";
    }
} else {
    echo "❌ Proveedor no encontrado.";
}

$stmt->close();
$conn->close();
?>