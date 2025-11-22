<?php
// Conexión a la base de datos
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}

// Recibir datos del formulario
$empresa     = $_POST['empresa'];
$tipo        = $_POST['tipo'];
$correo      = $_POST['correo'];
$telefono    = $_POST['telefono'];
$direccion   = $_POST['direccion'];
$ciudad      = $_POST['ciudad'];
$rnt         = $_POST['rnt'];
$idiomas     = $_POST['idiomas'];
$descripcion = $_POST['descripcion'];

// Manejo de imagen/logo
$logo = null;
if (isset($_FILES['logo']) && $_FILES['logo']['error'] == 0) {
    $logo = "uploads/" . basename($_FILES['logo']['name']);
    move_uploaded_file($_FILES['logo']['tmp_name'], $logo);
}

// Contraseña encriptada
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

// Insertar en la tabla proveedores
$stmt = $conn->prepare("INSERT INTO proveedores 
    (empresa, tipo, correo, telefono, direccion, ciudad, rnt, idiomas, descripcion, logo, password) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)");

$stmt->bind_param("sssssssssss", 
    $empresa, $tipo, $correo, $telefono, $direccion, $ciudad, $rnt, $idiomas, $descripcion, $logo, $password);

if ($stmt->execute()) {
    echo "✅ Proveedor registrado correctamente.";
    echo "<br><a href='login_proveedor.html'>Ir al login de proveedores</a>";
} else {
    echo "❌ Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>