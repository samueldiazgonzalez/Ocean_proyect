import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonItem, IonIcon, IonInput, IonButton, 
  IonSelect, IonSelectOption, IonSpinner, IonText,
  IonList, IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, callOutline, businessOutline, sparklesOutline, compassOutline, checkmark, informationCircleOutline, alertCircleOutline, arrowForwardOutline } from 'ionicons/icons';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonItem, IonIcon, IonInput, IonButton, 
    IonSelect, IonSelectOption, IonSpinner, IonText, 
    IonList, IonLabel,
    CommonModule, FormsModule
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
    addIcons({sparklesOutline,personOutline,callOutline,compassOutline,checkmark,businessOutline,informationCircleOutline,mailOutline,lockClosedOutline,alertCircleOutline,arrowForwardOutline});
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

      // 5. Enviamos correo, contraseña y los datos extra al servicio
      await this.authService.registrarUsuario(this.correo, this.contrasena, datosExtra);
      
      console.log('¡Registro exitoso con datos completos!');
      
     // 6. REDIRECCIÓN INTELIGENTE SEGÚN EL ROL:
      if (this.rol === 'proveedor') {
        // ¡Agregamos 'tabs' a la ruta!
        this.router.navigate(['/tabs/mis-tours']); 
      } else {
        // Al turista lo mandamos a vitrinear al catálogo
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
