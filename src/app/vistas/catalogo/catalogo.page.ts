import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { cashOutline, arrowForwardOutline } from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database';
import { Tour } from '../../core/models/tour.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonButton, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
    CommonModule, FormsModule, RouterModule
  ]
})
export class CatalogoPage implements OnInit {
  private databaseService = inject(DatabaseService);

  tours: Tour[] = [];
  cargando: boolean = true;

  constructor() {
    addIcons({ cashOutline, arrowForwardOutline });
  }

  ngOnInit() {
    // Nos suscribimos a Firebase para escuchar los paquetes turísticos en tiempo real
    this.databaseService.obtenerTours().subscribe({
      next: (data) => {
        this.tours = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el catálogo', err);
        this.cargando = false;
      }
    });
  }
}