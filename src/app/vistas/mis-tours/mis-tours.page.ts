import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonSpinner, IonFab, IonFabButton,
  AlertController, IonBadge, IonModal, IonList, IonItem, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonListHeader, IonLabel, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, cashOutline, eyeOutline, createOutline, pauseCircleOutline, 
  trashOutline, addCircleOutline, closeOutline, saveOutline, pricetagOutline, 
  textOutline, timeOutline, callOutline, locationOutline, star, ribbonOutline, 
  documentTextOutline, checkmarkCircleOutline, imageOutline, moonOutline, 
  mapOutline, alertCircleOutline, bedOutline, peopleOutline, informationCircleOutline 
} from 'ionicons/icons';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

import { DatabaseService } from '../../core/services/database';
import { AuthService } from '../../core/services/auth';
import { Tour } from '../../core/models/tour.model';

@Component({
  selector: 'app-mis-tours',
  templateUrl: './mis-tours.page.html',
  styleUrls: ['./mis-tours.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonSpinner, IonFab, IonFabButton,
    IonBadge, IonModal, IonList, IonItem, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonListHeader, IonLabel, IonButtons,
    CommonModule, FormsModule, RouterModule
  ]
})
export class MisToursPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private firestore = inject(Firestore);

  misTours: Tour[] = [];
  cargando: boolean = true;
  usuarioActual: any = null;

  // Variables para el Modal de Edición
  isModalOpen: boolean = false;
  tourEditando: any = null;
  guardandoEdicion: boolean = false;

  constructor() {
    addIcons({ 
      addOutline, cashOutline, eyeOutline, createOutline, pauseCircleOutline, 
      trashOutline, addCircleOutline, closeOutline, saveOutline, pricetagOutline, 
      textOutline, timeOutline, callOutline, locationOutline, star, ribbonOutline, 
      documentTextOutline, checkmarkCircleOutline, imageOutline, moonOutline, 
      mapOutline, alertCircleOutline, bedOutline, peopleOutline, informationCircleOutline
    });
  }

  async ngOnInit() {
    this.usuarioActual = await this.authService.obtenerDatosUsuarioActual();
    
    if (this.usuarioActual && this.usuarioActual.uid) {
      this.databaseService.obtenerToursPorProveedor(this.usuarioActual.uid).subscribe({
        next: (tours) => {
          this.misTours = tours;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar los tours', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
  }

  async suspender(tourId: string | undefined) {
    if (!tourId) return;
    const alert = await this.alertController.create({
      header: 'Pausar Servicio',
      message: '¿Ocultar este servicio del catálogo público?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sí, Pausar', 
          handler: async () => {
            await this.databaseService.suspenderTour(tourId);
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminar(tourId: string | undefined) {
    if (!tourId) return;
    const alert = await this.alertController.create({
      header: 'Eliminar Servicio',
      message: '¿Estás seguro? Esta acción borrará el tour definitivamente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: async () => {
            await this.databaseService.eliminarTour(tourId);
          }
        }
      ]
    });
    await alert.present();
  }

  // 👇 LÓGICA DEL MODAL DE EDICIÓN AVANZADA 👇

  editarTour(tour: Tour) {
    // Clonamos el objeto para no afectar la vista principal si el usuario cancela
    this.tourEditando = JSON.parse(JSON.stringify(tour));
    
    // 👇 FIX PARA LAS FOTOS 👇
    // Si ya existe una galería (que viene como lista de textos desde Firebase), 
    // la convertimos en lista de objetos para que el formulario la pueda leer.
    if (this.tourEditando.galeria && this.tourEditando.galeria.length > 0) {
      this.tourEditando.galeria = this.tourEditando.galeria.map((img: any) => {
        // Si es un texto puro, lo convertimos a objeto. Si ya era objeto, lo dejamos igual.
        return typeof img === 'string' ? { url: img } : img;
      });
    } else {
      // Si el tour es muy viejo y no tenía galería, usamos su imagen principal
      this.tourEditando.galeria = [{ url: this.tourEditando.imagenUrl || '' }];
    }
    // 👆 FIN DEL FIX 👆

    if (!this.tourEditando.extras) this.tourEditando.extras = [];
    if (!this.tourEditando.habitaciones) this.tourEditando.habitaciones = [];
    if (!this.tourEditando.telefono) this.tourEditando.telefono = this.tourEditando.telefonoContacto || '';

    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    setTimeout(() => this.tourEditando = null, 300); // Limpiar después de la animación
  }

  // Funciones auxiliares para los arrays dentro del Modal
  agregarImagenEdit() { this.tourEditando.galeria.push({ url: '' }); }
  eliminarImagenEdit(i: number) { this.tourEditando.galeria.splice(i, 1); }

  agregarExtraEdit() { this.tourEditando.extras.push({ nombre: '', precio: null }); }
  eliminarExtraEdit(i: number) { this.tourEditando.extras.splice(i, 1); }

  agregarHabitacionEdit() { this.tourEditando.habitaciones.push({ nombre: '', precio: null, capacidad: null, descripcion: '' }); }
  eliminarHabitacionEdit(i: number) { this.tourEditando.habitaciones.splice(i, 1); }

 async guardarEdicion() {
    if (!this.tourEditando.titulo || !this.tourEditando.categoria) {
      alert('⚠️ Por favor, ingresa al menos el título y la categoría.');
      return;
    }

    this.guardandoEdicion = true;

    try {
      // 👇 PROTECCIÓN ANTICRASH: Verificamos que existan antes de hacer .trim() 👇
      const imagenesLimpias = (this.tourEditando.galeria || [])
        .map((img:any) => img.url)
        .filter((u:any) => u && typeof u === 'string' && u.trim() !== '');

      const extrasLimpios = (this.tourEditando.extras || [])
        .filter((e:any) => e && e.nombre && typeof e.nombre === 'string' && e.nombre.trim() !== '' && e.precio > 0);

      const habitacionesLimpias = (this.tourEditando.habitaciones || [])
        .filter((h:any) => h && h.nombre && typeof h.nombre === 'string' && h.nombre.trim() !== '' && h.precio > 0);
      // 👆 FIN DE LA PROTECCIÓN 👆

      const tourRef = doc(this.firestore, `tours/${this.tourEditando.id}`);
      
      const updateData = {
        titulo: this.tourEditando.titulo,
        descripcion: this.tourEditando.descripcion || '',
        precio: Number(this.tourEditando.precio) || 0,
        categoria: this.tourEditando.categoria,
        duracion: this.tourEditando.duracion || '',
        incluye: this.tourEditando.incluye || '',
        telefonoContacto: this.tourEditando.telefono || '',
        direccion: this.tourEditando.direccion || '',
        opcionesAdicionales: this.tourEditando.opcionesAdicionales || '',
        galeria: imagenesLimpias,
        imagenUrl: imagenesLimpias.length > 0 ? imagenesLimpias[0] : '',
        extras: this.tourEditando.categoria === 'hoteles' ? [] : extrasLimpios,
        habitaciones: this.tourEditando.categoria === 'hoteles' ? habitacionesLimpias : [],
        estado: 'pendiente' // Pasa a auditoría
      };

      // Guardamos en Firebase
      await updateDoc(tourRef, updateData);
      
      // Actualizamos la tarjeta visualmente al instante
      const index = this.misTours.findIndex(t => t.id === this.tourEditando.id);
      if (index !== -1) {
        this.misTours[index] = { ...this.misTours[index], ...updateData };
      }

      // Cerramos el modal
      this.cerrarModal();

    } catch (err) {
      console.error("Error al guardar la edición:", err);
      alert('❌ Hubo un error al guardar. Revisa que tu conexión esté bien.');
    } finally {
      this.guardandoEdicion = false;
    }
  }
}