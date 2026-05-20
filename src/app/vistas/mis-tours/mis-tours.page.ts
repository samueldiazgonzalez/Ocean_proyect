import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonSpinner, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, cashOutline } from 'ionicons/icons';

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
    CommonModule, FormsModule, RouterModule
  ]
})
export class MisToursPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);

  misTours: Tour[] = [];
  cargando: boolean = true;

  constructor() {
    addIcons({ addOutline, cashOutline });
  }

  async ngOnInit() {
    // 1. Averiguamos quién es el proveedor conectado
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();
    
    if (usuarioActual && usuarioActual.uid) {
      // 2. Nos suscribimos solo a los tours que le pertenecen a este UID
      this.databaseService.obtenerToursPorProveedor(usuarioActual.uid).subscribe({
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
}