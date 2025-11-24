<?php
session_start();
if (!isset($_SESSION['proveedor_id'])) {
    header("Location: login_proveedor.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$proveedor_id = $_SESSION['proveedor_id'];

// Consultar datos del proveedor
$sql = "SELECT empresa, correo, telefono, ciudad, descripcion, logo, created_at 
        FROM proveedores WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $proveedor_id);
$stmt->execute();
$result = $stmt->get_result();
$proveedor = $result->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Perfil Proveedor</title>
  <link rel="stylesheet" href="perfil_estilo.css">
</head>
<body>

  <!-- SIDEBAR -->
  <aside class="sidebar">
   
   <nav class="sidebar-menu">

    <a href="clientes.php"><i class="ri-team-line"></i> Clientes</a>
  <a href="servicios.php"><i class="ri-briefcase-line"></i> Mis Servicios</a>
  <a class="active" href="perfil_proveedor.php"><i class="ri-user-3-line"></i> Mi Perfil</a>
  <a href="logout.php"><i class="ri-logout-box-r-line"></i> Cerrar Sesión</a>
</nav>
  </aside>

  <!-- CONTENIDO PRINCIPAL -->
  <main class="main">

    <!-- ENCABEZADO DEL PERFIL -->
    <section class="profile-header">
      <img src="<?php echo $proveedor['logo'] ?: 'imagenes/default.png'; ?>" alt="Logo Proveedor" class="avatar">
      <div>
        <h1><?php echo htmlspecialchars($proveedor['empresa']); ?></h1>
        <p class="sub">Miembro desde <?php echo date("F Y", strtotime($proveedor['created_at'])); ?></p>
      </div>
      <button class="btn-primary edit-btn">
        <i class="ri-edit-line"></i> Editar Perfil
      </button>
    </section>

    <!-- INFORMACIÓN PERSONAL -->
    <div class="card">
      <h3><i class="ri-id-card-line"></i> Información del Proveedor</h3>
      <p><strong>Correo:</strong> <?php echo htmlspecialchars($proveedor['correo']); ?></p>
      <p><strong>Teléfono:</strong> <?php echo htmlspecialchars($proveedor['telefono']); ?></p>
      <p><strong>Ciudad:</strong> <?php echo htmlspecialchars($proveedor['ciudad']); ?></p>
      <p><strong>Descripción:</strong> <?php echo htmlspecialchars($proveedor['descripcion']); ?></p>
      <button class="btn-secondary">Actualizar Información</button>
    </div>

    <!-- Aquí puedes añadir secciones como servicios publicados, estadísticas, etc. -->

  </main>
</body>
</html>