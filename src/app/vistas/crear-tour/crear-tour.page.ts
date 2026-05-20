// src/app/vistas/crear-tour/crear-tour.page.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonInput, IonTextarea, IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { textOutline, cashOutline, imageOutline, documentTextOutline } from 'ionicons/icons';

// Importamos los servicios vitales
import { DatabaseService } from '../../core/services/database';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-crear-tour',
  templateUrl: './crear-tour.page.html',
  styleUrls: ['./crear-tour.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonInput, IonTextarea, IonButton, IonIcon, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class CrearTourPage {
  
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);

  titulo: string = '';
  descripcion: string = '';
  precio: number | null = null;
  imagenUrl: string = '';
  
  cargando: boolean = false;

  constructor() {
    addIcons({ textOutline, cashOutline, imageOutline, documentTextOutline });
  }

  async guardarTour() {
    // 1. Validamos que no deje campos vacíos
    if (!this.titulo || !this.descripcion || !this.precio || !this.imagenUrl) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.cargando = true;

    try {
      // 2. Averiguamos el ID del proveedor actual
      const usuarioActual = await this.authService.obtenerDatosUsuarioActual();
      
      if (!usuarioActual || !usuarioActual.uid) {
        alert('Error: No se pudo identificar tu cuenta.');
        this.cargando = false;
        return;
      }

      // 3. Armamos el paquete de datos
      const nuevoTour = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        precio: this.precio,
        imagenUrl: this.imagenUrl,
        proveedorId: usuarioActual.uid, // <-- ¡Esto enlaza el tour con la agencia!
        estado: 'pendiente' // <-- LÍNEA NUEVA AÑADIDA
      };

      // 4. Lo enviamos a Firebase usando el nombre correcto de tu servicio
      await this.databaseService.agregarTour(nuevoTour as any);      
      // 5. Limpiamos y redirigimos al panel
      this.titulo = '';
      this.descripcion = '';
      this.precio = null;
      this.imagenUrl = '';
      
      this.router.navigate(['/tabs/mis-tours']);
      
    } catch (error) {
      console.error(error);
      alert('Hubo un error al publicar el tour.');
    } finally {
      this.cargando = false;
    }
  }
}