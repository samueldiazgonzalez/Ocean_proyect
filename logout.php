<?php
session_start();        // inicia la sesión para poder destruirla
session_unset();        // elimina todas las variables de sesión
session_destroy();      // destruye la sesión

// Redirige a la página principal
header("Location: turismo.php");
exit();
?>