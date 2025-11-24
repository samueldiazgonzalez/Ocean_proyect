<?php
session_start();
if (!isset($_SESSION['proveedor_id'])) {
    header("Location: login_proveedor.html");
    exit();
}

$conn = new mysqli("db", "root", "rootpass", "OceanDB");
if ($conn->connect_error) die("Error DB: " . $conn->connect_error);

$proveedor_id = $_SESSION['proveedor_id'];

// Consultar servicios del proveedor
$sql = "SELECT id, titulo, descripcion, tarifa, duracion, horarios, estado 
        FROM servicios WHERE proveedor_id=? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $proveedor_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mis Servicios - Proveedor</title>
  <link rel="stylesheet" href="servicios.css">
</head>
<body>
  <div class="wrapper">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">PT</div>
        <div class="brand-text">
          <div>Portal</div>
          <div class="subtitle">Proveedores</div>
        </div>
      </div>

      <nav class="nav">
        <a href="proveedor.html">Dashboard</a>
        <a class="active" href="servicios.php">Mis Servicios</a>
        <a href="perfil_proveedor.php">Perfil</a>
        <a href="clientes.html">Clientes</a>
        <a href="configuracion.html">Ajustes</a>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <h1>Mis Servicios</h1>
        <div class="actions">
          <input id="search" placeholder="Buscar servicio..." />
          <select id="statusFilter">
            <option value="all">Todos</option>
            <option value="Activo">Activos</option>
            <option value="Pausado">Pausados</option>
          </select>
        
          <a href="registro_servicio.html" class="btn primary">+ Añadir</a>
        </div>
      </header>

      <section class="content">
        <aside class="left-col">
          <div id="servicesList" class="services">
            <?php if ($result->num_rows > 0): ?>
              <?php while($row = $result->fetch_assoc()): ?>
                <div class="service">
                  <div class="left">
                    <div class="icon"><?php echo strtoupper(substr($row['titulo'],0,1)); ?></div>
                    <div>
                      <h4><?php echo htmlspecialchars($row['titulo']); ?></h4>
                      <p><?php echo htmlspecialchars($row['descripcion']); ?></p>
                      <div class="meta">
                        💲<?php echo number_format($row['tarifa'],2); ?> · 
                        <span class="pill"><?php echo $row['estado']; ?></span>
                      </div>
                    </div>
                  </div>
              <div class="actions">
  <a href="editar_servicio.php?id=<?php echo $row['id']; ?>" class="btn ghost">Editar</a>
  <a href="eliminar_servicio.php?id=<?php echo $row['id']; ?>" class="btn danger" onclick="return confirm('¿Seguro que deseas eliminar este servicio?');">Eliminar</a>
  <a href="toggle_servicio.php?id=<?php echo $row['id']; ?>" class="btn">
    <?php echo $row['estado']==='Activo' ? 'Pausar' : 'Activar'; ?>
  </a>
</div>
                </div>
              <?php endwhile; ?>
            <?php else: ?>
              <p>No tienes servicios registrados aún.</p>
            <?php endif; ?>
          </div>
        </aside>

        <section class="right-col">
          <div id="emptyRight" class="card empty-panel">
            <p>Selecciona un servicio a la izquierda para ver o editar los detalles.</p>
            <img src="imagenes/imagen_proveedor.jpg" alt="avatar proveedor">
          </div>
        </section>
      </section>
    </main>
  </div>
</body>
</html>