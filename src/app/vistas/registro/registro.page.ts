import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonIcon, IonInput, IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  sparklesOutline, personOutline, callOutline, compassOutline, checkmark,
  businessOutline, informationCircleOutline, mailOutline, lockClosedOutline, 
  alertCircleOutline, arrowForwardOutline
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonIcon, IonInput, IonSpinner,
    CommonModule, FormsModule, RouterModule
  ]
})
export class RegistroPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  nombre: string = '';
  correo: string = '';
  contrasena: string = '';
  telefono: string = '';
  rol: 'viajero' | 'proveedor' = 'viajero'; 
  nombreAgencia: string = '';
  
  cargando: boolean = false;
  mensajeError: string = '';

  constructor() {
    addIcons({
      sparklesOutline, personOutline, callOutline, compassOutline, checkmark,
      businessOutline, informationCircleOutline, mailOutline, lockClosedOutline,
      alertCircleOutline, arrowForwardOutline
    });
  }

  async registrar() {
    if (!this.nombre || !this.correo || !this.contrasena || !this.telefono) {
      this.mensajeError = 'Por favor completa todos los campos básicos.';
      return;
    }
    
    if (this.contrasena.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.rol === 'proveedor' && !this.nombreAgencia) {
      this.mensajeError = 'Como proveedor, debes escribir el nombre de tu agencia.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    try {
      const datosExtra = {
        nombre: this.nombre,
        rol: this.rol,
        telefono: this.telefono,
        nombreAgencia: this.nombreAgencia
      };

      await this.authService.registrarUsuario(this.correo, this.contrasena, datosExtra);
      
      console.log('¡Registro exitoso con datos completos!');
      
      if (this.rol === 'proveedor') {
        this.router.navigate(['/tabs/mis-tours']); 
      } else {
        this.router.navigate(['/tabs/catalogo']);
      }

    } catch (error: any) {
      console.error(error);
      this.mensajeError = 'Error al registrar. Verifica el correo o intenta con otro.';
    } finally {
      this.cargando = false;
    }
  }
}