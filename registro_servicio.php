<?php
session_start();
if (!isset($_SESSION['proveedor_id'])) {
    die("❌ Debes iniciar sesión como proveedor.");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("⚠️ Acceso inválido. Debes enviar el formulario desde registro_servicio.html");
}
// Conexión
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}

// Recuperar el ID del proveedor desde la sesión
$proveedor_id = $_SESSION['proveedor_id'];

if (empty($proveedor_id)) {
    die("❌ No se encontró el proveedor en la sesión. Debes iniciar sesión correctamente.");
}

// Variables POST
$categoria   = $_POST['categoria']   ?? null;
$nombre      = $_POST['nombre_servicio'] ?? null;
$descripcion = $_POST['descripcion'] ?? null;
$duracion    = $_POST['duracion']    ?? null;
$precio      = $_POST['precio']      ?? null;
$horarios    = $_POST['horarios']    ?? null;
$edad_minima = $_POST['edad_minima'] ?? null;
$capacidad   = $_POST['capacidad']   ?? null;
$etiquetas   = $_POST['etiquetas']   ?? null;
$incluye     = $_POST['incluye']     ?? null;
$notas       = $_POST['notas']       ?? null;

// Manejo de imágenes...
// INSERT con $conn->prepare()
// Manejo de imágenes
$imagenes = [];
if (!empty($_FILES['imagenes']['name'][0])) {
    foreach ($_FILES['imagenes']['tmp_name'] as $index => $tmpName) {
        $fileName = basename($_FILES['imagenes']['name'][$index]);
        $targetPath = "uploads/" . uniqid() . "_" . $fileName;
        if (move_uploaded_file($tmpName, $targetPath)) {
            $imagenes[] = $targetPath;
        }
    }
}
$imagenes_json = json_encode($imagenes);

// Insertar en la DB
$sql = "INSERT INTO servicios 
        (proveedor_id, categoria, titulo, descripcion, duracion, tarifa, horarios, edad_minima, capacidad, etiquetas, incluye, notas, imagenes) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isssdsiiissss", 
    $proveedor_id, $categoria, $nombre, $descripcion, $duracion, $precio, $horarios, $edad_minima, $capacidad, $etiquetas, $incluye, $notas, $imagenes_json
);

if ($stmt->execute()) {
    header("Location: servicios.php");
    exit();
}
 else {
    echo "❌ Error al registrar servicio: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>