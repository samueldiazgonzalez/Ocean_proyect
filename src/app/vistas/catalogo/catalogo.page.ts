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
import { cashOutline, arrowForwardOutline, star } from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database';

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

  // Lo dejamos como any[] para poder agregarle las estrellas dinámicamente sin que TypeScript pelee
  tours: any[] = []; 
  cargando: boolean = true;

  constructor() {
    addIcons({ cashOutline, arrowForwardOutline, star });
  }

  ngOnInit() {
    // Nos suscribimos a Firebase para escuchar los paquetes turísticos en tiempo real
    this.databaseService.obtenerTours().subscribe({
      next: (data) => {
        this.tours = data;
        
        // 👇 Por cada tour, buscamos sus reseñas en tiempo real para calcular el promedio
        this.tours.forEach(tour => {
          if (tour.id) {
            this.databaseService.obtenerResenasPorTour(tour.id).subscribe(resenas => {
              if (resenas.length > 0) {
                const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
                tour.promedioEstrellas = (suma / resenas.length).toFixed(1);
                tour.totalResenas = resenas.length;
              } else {
                tour.promedioEstrellas = 0;
                tour.totalResenas = 0;
              }
            });
          }
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el catálogo', err);
        this.cargando = false;
      }
    });
  }
}