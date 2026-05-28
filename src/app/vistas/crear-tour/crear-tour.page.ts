import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonInput, IonTextarea, IonButton, IonIcon, 
  IonSpinner, IonSelect, IonSelectOption, IonListHeader, IonLabel, 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  textOutline, cashOutline, imageOutline, documentTextOutline, 
  pricetagOutline, timeOutline, checkmarkCircleOutline, trashOutline, 
  addCircleOutline, callOutline, locationOutline, star, ribbonOutline, bedOutline, peopleOutline, informationCircleOutline,    
    moonOutline, mapOutline, alertCircleOutline} from 'ionicons/icons';

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
  telefono: string = ''; 
  direccion: string = '';         
  opcionesAdicionales: string = '';
  
  galeria: { url: string }[] = [{ url: '' }];
  extras: { nombre: string, precio: number }[] = []; 
  habitaciones: { nombre: string, precio: number, capacidad: number, descripcion: string }[] = []; // <--- NUEVO
  
  cargando: boolean = false;

  constructor() {
    addIcons({
      pricetagOutline,textOutline,cashOutline,timeOutline,callOutline,
      locationOutline,addCircleOutline,star,ribbonOutline,documentTextOutline,
      checkmarkCircleOutline,imageOutline,trashOutline,bedOutline,peopleOutline,
      informationCircleOutline, moonOutline, mapOutline, alertCircleOutline 
    });
  }

  agregarImagen() { this.galeria.push({ url: '' }); }
  eliminarImagen(index: number) { this.galeria.splice(index, 1); }

  agregarExtra() { this.extras.push({ nombre: '', precio: null as any }); }
  eliminarExtra(index: number) { this.extras.splice(index, 1); }

  // 👇 LÓGICA DE HOTELES 👇
  agregarHabitacion() { 
    this.habitaciones.push({ nombre: '', precio: null as any, capacidad: null as any, descripcion: '' }); 
  }
  eliminarHabitacion(index: number) { this.habitaciones.splice(index, 1); }

  async guardarTour() {
    const imagenesLimpias = this.galeria.map(img => img.url).filter(url => url.trim() !== '');
    const extrasLimpios = this.extras.filter(extra => extra.nombre.trim() !== '' && extra.precio > 0);
    const habitacionesLimpias = this.habitaciones.filter(hab => hab.nombre.trim() !== '' && hab.precio > 0);

    if (!this.titulo || !this.descripcion || !this.precio || !this.categoria || imagenesLimpias.length === 0) {
      alert('Por favor, completa los campos obligatorios y añade al menos una foto.');
      return;
    }

    this.cargando = true;

    try {
      const usuarioActual = await this.authService.obtenerDatosUsuarioActual();
      if (!usuarioActual || !usuarioActual.uid) return;

      const nuevoTour = {
        titulo: this.titulo,
        descripcion: this.descripcion,
        precio: this.precio, // Si es hotel, este es el precio "Desde..."
        categoria: this.categoria, 
        duracion: this.duracion,
        incluye: this.incluye,
        telefonoContacto: this.telefono, 
        imagenUrl: imagenesLimpias[0], 
        galeria: imagenesLimpias,
        proveedorId: usuarioActual.uid, 
        direccion: this.direccion,                     
        opcionesAdicionales: this.opcionesAdicionales,
        extras: this.categoria === 'hoteles' ? [] : extrasLimpios, // Si es hotel, no guarda extras
        habitaciones: this.categoria === 'hoteles' ? habitacionesLimpias : [], // Si es tour, no guarda habitaciones
        estado: 'pendiente' 
      };

      await this.databaseService.agregarTour(nuevoTour as any);      
      this.router.navigate(['/tabs/mis-tours']);
      
    } catch (error) {
      console.error(error);
      alert('Hubo un error al publicar el servicio.');
    } finally {
      this.cargando = false;
    }
  }
}