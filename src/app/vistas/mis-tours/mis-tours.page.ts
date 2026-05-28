import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonSpinner, IonFab, IonFabButton,
  AlertController, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, cashOutline, eyeOutline, createOutline, pauseCircleOutline, trashOutline, addCircleOutline } from 'ionicons/icons';
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
    IonBadge, CommonModule, FormsModule, RouterModule
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

  constructor() {
    addIcons({ addOutline, cashOutline, eyeOutline, createOutline, pauseCircleOutline, trashOutline, addCircleOutline });
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
          console.error('Error al cargar los tours del proveedor', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
      console.error('No se pudo identificar al proveedor');
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
      message: '¿Estás seguro? Esta acción no se puede deshacer y borrará el tour definitivamente.',
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

  async editarTour(tour: Tour) {
    const alert = await this.alertController.create({
      header: 'Edición Rápida',
      message: 'Si cambias los datos, el servicio pasará a estado "En Auditoría" y dejará de ser visible hasta que el Administrador lo apruebe nuevamente.',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          value: tour.titulo,
          placeholder: 'Nombre del Servicio'
        },
        {
          name: 'precio',
          type: 'number',
          value: tour.precio,
          placeholder: 'Precio (COP)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar y Auditar', 
          handler: async (data) => {
            if (!data.titulo || !data.precio || !tour.id) return;
            try {
              const tourRef = doc(this.firestore, `tours/${tour.id}`);
              await updateDoc(tourRef, { 
                titulo: data.titulo, 
                precio: Number(data.precio),
                estado: 'pendiente' 
              });
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}