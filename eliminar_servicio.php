<?php
session_start();
if (!isset($_SESSION['proveedor_id'])) { header("Location: login_proveedor.html"); exit(); }

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
$id = $_GET['id'];

$sql = "DELETE FROM servicios WHERE id=? AND proveedor_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id, $_SESSION['proveedor_id']);
$stmt->execute();

header("Location: servicios.php");
exit();
?>