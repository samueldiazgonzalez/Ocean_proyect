import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Asegúrate de que esta ruta apunte bien a tu servicio

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Le preguntamos a Firebase si hay alguien conectado
  const usuario = await authService.obtenerDatosUsuarioActual();

  if (usuario) {
    // Si hay usuario, le abrimos la puerta
    return true;
  } else {
    // Si no hay usuario, lo pateamos a la pantalla de login
    console.warn('Acceso denegado: Debes iniciar sesión');
    router.navigate(['/login']); 
    return false;
  }
};