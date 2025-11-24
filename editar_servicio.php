<?php
session_start();
if (!isset($_SESSION['proveedor_id'])) { header("Location: login_proveedor.html"); exit(); }

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$id = $_GET['id'];
$sql = "SELECT * FROM servicios WHERE id=? AND proveedor_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id, $_SESSION['proveedor_id']);
$stmt->execute();
$result = $stmt->get_result();
$servicio = $result->fetch_assoc();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = $_POST['titulo'];
    $descripcion = $_POST['descripcion'];
    $tarifa = $_POST['tarifa'];
    $duracion = $_POST['duracion'];
    $horarios = $_POST['horarios'];

    $update = $conn->prepare("UPDATE servicios SET titulo=?, descripcion=?, tarifa=?, duracion=?, horarios=? WHERE id=? AND proveedor_id=?");
    $update->bind_param("ssdisii", $titulo, $descripcion, $tarifa, $duracion, $horarios, $id, $_SESSION['proveedor_id']);
    if ($update->execute()) {
        echo " Servicio actualizado correctamente.";
        echo "<br><a href='servicios.php'>Volver a Mis Servicios</a>";
        exit();
    } else {
        echo "❌ Error al actualizar: " . $update->error;
    }
}
?>

<form method="POST">
  <label>Título</label><input name="titulo" value="<?php echo htmlspecialchars($servicio['titulo']); ?>" required>
  <label>Descripción</label><textarea name="descripcion" required><?php echo htmlspecialchars($servicio['descripcion']); ?></textarea>
  <label>Tarifa</label><input type="number" step="0.01" name="tarifa" value="<?php echo $servicio['tarifa']; ?>" required>
  <label>Duración (h)</label><input type="number" step="0.5" name="duracion" value="<?php echo $servicio['duracion']; ?>">
  <label>Horarios</label><input type="text" name="horarios" value="<?php echo htmlspecialchars($servicio['horarios']); ?>">
  <button type="submit">Guardar Cambios</button>
</form>