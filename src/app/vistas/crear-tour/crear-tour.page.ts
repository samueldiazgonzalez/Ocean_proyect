import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonInput, IonTextarea, IonButton, IonIcon, 
  IonSpinner, IonSelect, IonSelectOption, IonListHeader, IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  textOutline, cashOutline, imageOutline, documentTextOutline, 
  pricetagOutline, timeOutline, checkmarkCircleOutline, trashOutline, addCircleOutline
} from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-crear-tour',
  templateUrl: './crear-tour.page.html',
  styleUrls: ['./crear-tour.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonInput, IonTextarea, IonButton, IonIcon, 
    IonSpinner, IonSelect, IonSelectOption, IonListHeader, IonLabel,
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
  categoria: string = '';
  duracion: string = '';
  incluye: string = '';
  
  // En vez de una sola imagen, usamos un arreglo de objetos para la galería
  galeria: { url: string }[] = [{ url: '' }];
  
  cargando: boolean = false;

  constructor() {
    addIcons({ 
      textOutline, cashOutline, imageOutline, documentTextOutline, 
      pricetagOutline, timeOutline, checkmarkCircleOutline, trashOutline, addCircleOutline 
    });
  }

  // Funciones para manejar la galería dinámica
  agregarImagen() {
    this.galeria.push({ url: '' });
  }

  eliminarImagen(index: number) {
    this.galeria.splice(index, 1);
  }

  async guardarTour() {
    // 1. Limpiamos las URLs vacías de la galería
    const imagenesLimpias = this.galeria.map(img => img.url).filter(url => url.trim() !== '');

    // 2. Validamos que no falte lo básico
    if (!this.titulo || !this.descripcion || !this.precio || !this.categoria || imagenesLimpias.length === 0) {
      alert('Por favor, completa los campos obligatorios y añade al menos una foto.');
      return;
    }

    this.cargando = true;

    try {
      const usuarioActual = await this.authService.obtenerDatosUsuarioActual();
      
      if (!usuarioActual || !usuarioActual.uid) {
        alert('Error: No se pudo identificar tu cuenta.');
        this.cargando = false;
        return;
      }

      // 3. Armamos el paquete de datos super completo
      const nuevoTour = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        precio: this.precio,
        categoria: this.categoria,
        duracion: this.duracion,
        incluye: this.incluye,
        // Guardamos la primera foto como principal para las portadas
        imagenUrl: imagenesLimpias[0], 
        // Y guardamos el arreglo completo para la vista de detalles
        galeria: imagenesLimpias,
        proveedorId: usuarioActual.uid, 
        estado: 'pendiente' 
      };

      await this.databaseService.agregarTour(nuevoTour as any);      
      
      // 4. Limpiamos y redirigimos
      this.titulo = '';
      this.descripcion = '';
      this.precio = null;
      this.categoria = '';
      this.duracion = '';
      this.incluye = '';
      this.galeria = [{ url: '' }];
      
      this.router.navigate(['/tabs/mis-tours']);
      
    } catch (error) {
      console.error(error);
      alert('Hubo un error al publicar el tour.');
    } finally {
      this.cargando = false;
    }
  }
}