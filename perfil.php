<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

// Conexión a la base
$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) {
    die("❌ Conexión fallida: " . $conn->connect_error);
}

// Obtener datos del usuario
$user_id = $_SESSION['user_id'];
$sql = "SELECT username, email, telefono FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ocean - Perfil</title>
  <link rel="stylesheet" href="perfil_estilo.css">
  <script src="funcionalidades.js" defer></script>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">

  <!-- Ajustes dinámicos -->
  <script>
    let nombre = "<?php echo htmlspecialchars($user['username']); ?>";
    let correo = "<?php echo htmlspecialchars($user['email']); ?>";
    let tel    = "<?php echo htmlspecialchars($user['telefono']); ?>";
    let ciudad = "<?php echo htmlspecialchars($user['ciudad']); ?>";
  </script>
</head>
<body>
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <h2 class="brand">Ocean System</h2>
    <nav class="sidebar-menu">
      <a href="turismo.php"><i class="ri-home-4-line"></i> Inicio</a>
      <a href="#"><i class="ri-earth-line"></i> Explorar</a>
      <a href="#"><i class="ri-bookmark-line"></i> Reservas</a>
      <a class="active" href="perfil.php"><i class="ri-user-3-line"></i> Mi Perfil</a>
      <a href="#"><i class="ri-settings-3-line"></i> Configuración</a>
      <a href="logout.php"><i class="ri-logout-box-r-line"></i> Cerrar Sesión</a>
    </nav>
  </aside>

  <!-- CONTENIDO PRINCIPAL -->
  <main class="main">
    <!-- ENCABEZADO DEL PERFIL -->
    <section class="profile-header">
      <img src="https://i.pravatar.cc/250" alt="Foto de Perfil" class="avatar">
      <div>
        <h1><?php echo htmlspecialchars($user['username']); ?></h1>
        <p class="sub">Miembro desde 2024</p>
      </div>
      <button class="btn-primary edit-btn">
        <i class="ri-edit-line"></i> Editar Perfil
      </button>
    </section>

    <!-- GRID DE INFORMACIÓN -->
    <div class="grid">
      <!-- INFORMACIÓN PERSONAL CIUDAD AUN NO SE AÑADIO EN LA BASE DE DATOS SAAAAA -->
      <div class="card">
        <h3><i class="ri-id-card-line"></i> Información Personal</h3>
        <p><strong>Nombre completo:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
        <p><strong>Correo:</strong> <?php echo htmlspecialchars($user['email']); ?></p>
        <p><strong>Teléfono:</strong> <?php echo htmlspecialchars($user['telefono']); ?></p>
       <!-- <p><strong>Ciudad:</strong> <?php echo htmlspecialchars($user['ciudad']); ?></p>-->
        <button class="btn-secondary">Actualizar Información</button>
        <form action="eliminar.php" method="POST" onsubmit="return confirm('¿Seguro que deseas eliminar tu cuenta?');">
          <button type="submit" class="btn-secondary" style="background:#dc3545;color:#fff;">Eliminar Cuenta</button>
        </form>
      </div>
    </div>
  </main>
</body>
</html>