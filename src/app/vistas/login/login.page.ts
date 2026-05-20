import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonCard, IonCardContent, IonItem, 
  IonIcon, IonInput, IonButton, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, compassOutline, logoGoogle } from 'ionicons/icons'; 

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardContent, IonItem, IonIcon, 
    IonInput, IonButton, IonSpinner, IonText, 
    CommonModule, FormsModule, RouterModule 
  ]
})
export class LoginPage {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  correo: string = '';
  contrasena: string = '';
  cargando: boolean = false;
  mensajeError: string = '';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, compassOutline, logoGoogle });
  }

  async iniciarSesion() {
    if (!this.correo || !this.contrasena) {
      this.mensajeError = 'Por favor llena todos los campos';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    try {
      await this.authService.login(this.correo, this.contrasena);
      const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

      if (usuarioActual) {
        if ((usuarioActual as any).rol === 'admin') {
          this.router.navigate(['/tabs/perfil']);
        } else if (usuarioActual.rol === 'proveedor') {
          this.router.navigate(['/tabs/mis-tours']);
        } else {
          this.router.navigate(['/tabs/catalogo']);
        }
      }
    } catch (error: any) {
      this.mensajeError = 'Correo o contraseña incorrectos';
    } finally {
      this.cargando = false;
    }
  }

  async iniciarSesionGoogle() {
    this.cargando = true;
    this.mensajeError = '';

    try {
      await this.authService.loginConGoogle();
      const datosUsuario = await this.authService.obtenerDatosUsuarioActual();

      if (datosUsuario) {
        if ((datosUsuario as any).rol === 'admin') {
          this.router.navigate(['/tabs/perfil']);
        } else if (datosUsuario.rol === 'proveedor') {
          this.router.navigate(['/tabs/mis-tours']);
        } else {
          this.router.navigate(['/tabs/catalogo']);
        }
      }
    } catch (error: any) {
      this.mensajeError = 'El inicio de sesión con Google fue cancelado o falló.';
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}