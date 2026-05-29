import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
  IonSpinner, IonIcon, IonCard, IonCardContent, IonBadge, IonButton,
  IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, arrowForwardOutline, star } from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-mis-favoritos',
  templateUrl: './mis-favoritos.page.html',
  styleUrls: ['./mis-favoritos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
    IonSpinner, IonIcon, IonCard, IonCardContent, IonBadge, IonButton,
    IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonButtons, IonBackButton,
    CommonModule, FormsModule, RouterModule
  ]
})
export class MisFavoritosPage {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);

  toursFavoritos: any[] = [];
  cargando: boolean = true;

  constructor() {
    addIcons({ heart, heartOutline, arrowForwardOutline, star });
  }

  async ionViewWillEnter() {
    this.cargarFavoritos();
  }

  async cargarFavoritos() {
    this.cargando = true;
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (usuarioActual && usuarioActual.uid) {
      this.databaseService.obtenerFavoritosPorTurista(usuarioActual.uid).subscribe({
        next: async (favs) => {
          const listaTemporal = [];
          for (const f of favs) {
            const detalles = await this.databaseService.obtenerTourPorId(f.tourId);
            if (detalles) {
              listaTemporal.push(detalles);
            }
          }
          this.toursFavoritos = listaTemporal;
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
  }
}