import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonBadge, IonSpinner, IonIcon, IonCard, IonCardContent 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, walletOutline, textOutline, cardOutline } from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.page.html',
  styleUrls: ['./mis-reservas.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
    IonLabel, IonBadge, IonSpinner, IonIcon, IonCard, IonCardContent,
    CommonModule, FormsModule, RouterModule
  ]
})
export class MisReservasPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);

  reservasCompletas: any[] = [];
  cargando: boolean = true;

  constructor() {
    addIcons({calendarOutline,walletOutline,cardOutline,textOutline});
  }

  async ngOnInit() {
    // 1. Obtener el ID del turista logueado
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (usuarioActual && usuarioActual.uid) {
      // 2. Escuchar las reservas en tiempo real
      this.databaseService.obtenerReservasPorTurista(usuarioActual.uid).subscribe({
        next: async (reservas) => {
          const listaTemporal = [];

          // 3. Cruzar datos: Por cada reserva, buscamos el nombre del tour
          for (const reserva of reservas) {
            const detallesDelTour = await this.databaseService.obtenerTourPorId(reserva.tourId);
            
            listaTemporal.push({
              ...reserva,
              tituloTour: detallesDelTour ? detallesDelTour.titulo : 'Tour no disponible',
              precioTour: detallesDelTour ? detallesDelTour.precio : 0
            });
          }

          // Ordenamos para que las más recientes salgan primero
          this.reservasCompletas = listaTemporal.sort((a, b) => 
            new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime()
          );
          
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar historial', err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
  }
}