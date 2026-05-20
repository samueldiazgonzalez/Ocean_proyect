import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
  IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonButtons, 
  IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, AlertController, IonSegment, 
  IonSegmentButton, IonThumbnail 
} from '@ionic/angular/standalone';

import { DatabaseService } from '../../core/services/database';
import { Tour } from '../../core/models/tour.model';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, earthOutline, ticketOutline, pauseCircle, trash } from 'ionicons/icons';

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.page.html',
  styleUrls: ['./panel-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
    IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonButtons, 
    IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonSegment, IonSegmentButton, IonThumbnail,
    CommonModule, FormsModule
  ]
})
export class PanelAdminPage implements OnInit {
  
  private databaseService = inject(DatabaseService);
  private alertController = inject(AlertController);
  
  toursPendientes: Tour[] = [];
  toursActivos: Tour[] = [];
  totalToursActivos: number = 0;
  segmentoActual: string = 'pendientes';

  constructor() {
    addIcons({ checkmarkCircleOutline, earthOutline, ticketOutline, pauseCircle, trash });
  }

  ngOnInit() {
    this.databaseService.obtenerToursPendientes().subscribe(tours => {
      this.toursPendientes = tours;
    });

    this.databaseService.obtenerTours().subscribe(tours => {
      this.toursActivos = tours;
      this.totalToursActivos = tours.length;
    });
  }

  cambiarTab(event: any) {
    this.segmentoActual = event.detail.value;
  }

  async confirmarAprobacion(tourId: string | undefined) {
    if (!tourId) return;

    const alert = await this.alertController.create({
      header: 'Auditoría de Tour',
      message: '¿Estás seguro de aprobar este paquete? Se volverá público en el catálogo.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sí, Aprobar', handler: () => { this.aprobar(tourId); } }
      ]
    });

    await alert.present();
  }

  async aprobar(tourId: string) {
    try {
      await this.databaseService.aprobarTour(tourId);
    } catch (error) {
      console.error(error);
    }
  }

  async suspender(tourId: string | undefined) {
    if (!tourId) return;
    try {
      await this.databaseService.suspenderTour(tourId);
    } catch (error) {
      console.error(error);
    }
  }

  async eliminar(tourId: string | undefined) {
    if (!tourId) return;
    
    const alert = await this.alertController.create({
      header: 'Eliminar Registro',
      message: '¿Estás seguro de que deseas eliminar este tour definitivamente de la base de datos?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive', 
          handler: async () => {
            try {
              await this.databaseService.eliminarTour(tourId);
            } catch (error) {
              console.error(error);
            }
          } 
        }
      ]
    });

    await alert.present();
  }
}