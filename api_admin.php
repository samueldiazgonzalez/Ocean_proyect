<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    echo json_encode(["error" => "❌ Error DB: " . $conn->connect_error]);
    exit();
}

$type = $_GET['type'] ?? '';

switch ($type) {
    case 'suppliers':
        $sql = "SELECT id, empresa AS name, tipo, correo, telefono, ciudad, created_at 
                FROM proveedores";
        break;

    case 'services':
        $sql = "SELECT s.id, s.titulo AS name, p.empresa AS supplier, s.proveedor_id, s.estado
                FROM servicios s
                JOIN proveedores p ON s.proveedor_id = p.id";
        break;

    case 'reviews':
        $sql = "SELECT r.id, u.username AS user, p.empresa AS supplier, s.titulo AS service,
                       r.rating, r.comentario, r.created_at
                FROM reseñas r
                JOIN usuarios u ON r.usuario_id = u.id
                JOIN servicios s ON r.servicio_id = s.id
                JOIN proveedores p ON s.proveedor_id = p.id
                ORDER BY r.created_at DESC";
        break;

    case 'users':
        $sql = "SELECT id, username AS name, email, created_at AS registeredDate 
                FROM usuarios";
        break;

    case 'tickets':
        $sql = "SELECT id, subject, user, date, status 
                FROM soporte_tickets"; // si tienes tabla de soporte
        break;

    default:
        echo json_encode(["error" => "Tipo de consulta inválido"]);
        $conn->close();
        exit();
}

$result = $conn->query($sql);
$data = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}
echo json_encode($data);

$conn->close();
?>