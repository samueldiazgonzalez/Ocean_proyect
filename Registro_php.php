<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $categoria = $_POST['categoria'];
    $tags = implode(",", $_POST['tags']);
    $precio = $_POST['precio'];
    $duracion = $_POST['duracion'];
    $ubicacion = $_POST['ubicacion'];

    // Crear carpeta si no existe
    if (!is_dir("uploads")) {
        mkdir("uploads", 0777, true);
    }

    $imagenesSubidas = [];

    foreach ($_FILES['imagenes']['tmp_name'] as $key => $tmpName) {
        $nombreArchivo = time() . "_" . $_FILES['imagenes']['name'][$key];
        $ruta = "uploads/" . $nombreArchivo;
        
        if (move_uploaded_file($tmpName, $ruta)) {
            $imagenesSubidas[] = $nombreArchivo;
        }
    }

    echo "<h2>Servicio registrado correctamente</h2>";
    echo "<p><b>Nombre:</b> $nombre</p>";
    echo "<p><b>Categoría:</b> $categoria</p>";
    echo "<p><b>Tags:</b> $tags</p>";
    echo "<p><b>Precio:</b> $precio</p>";
    echo "<p><b>Duración:</b> $duracion</p>";
    echo "<p><b>Ubicación:</b> $ubicacion</p>";
    echo "<h3>Imágenes Subidas:</h3>";

    foreach ($imagenesSubidas as $img) {
        echo "<img src='uploads/$img' width='200' style='margin:10px;'>";
    }

}
?>
