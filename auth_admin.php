<?php
session_start();

// Verificar si el admin está logueado
if (!isset($_SESSION['admin_id'])) {
    // Si no hay sesión, redirigir al login
    header("Location: login_admin.html");
    exit();
}

// Opcional: puedes restringir por rol
// if ($_SESSION['admin_rol'] !== 'Principal') {
//     die("❌ No tienes permisos para acceder a esta sección.");
// }
?>