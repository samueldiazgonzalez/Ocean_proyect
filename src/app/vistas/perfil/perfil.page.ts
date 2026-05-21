import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonSpinner,
  IonBadge, IonListHeader, IonCard, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircle, briefcaseOutline, settingsOutline, 
  helpCircleOutline, logOutOutline, ticketOutline,
  logInOutline, personAddOutline, shieldCheckmark, heartOutline,
  pencilOutline
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth';
import { DatabaseService } from '../../core/services/database';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonIcon, IonList, IonItem, IonLabel, IonSpinner,
    IonBadge, IonListHeader, IonCard,
    CommonModule, FormsModule, RouterModule 
  ]
})
export class PerfilPage { 
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  uid: string = '';
  nombre: string = '';
  apodo: string = '';
  fotoUrl: string = '';
  rol: string = '';
  cargandoDatos: boolean = true;
  esInvitado: boolean = false; 

  constructor() {
    addIcons({ 
      personCircle, briefcaseOutline, settingsOutline, 
      helpCircleOutline, logOutOutline, ticketOutline,
      logInOutline, personAddOutline, shieldCheckmark, heartOutline,
      pencilOutline
    });
  }

  async ionViewWillEnter() {
    this.cargandoDatos = true; 
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (usuarioActual) {
      this.uid = usuarioActual.uid || '';
      this.nombre = usuarioActual.nombre || '';
      this.apodo = (usuarioActual as any).apodo || '';
      this.fotoUrl = (usuarioActual as any).fotoUrl || '';
      this.rol = usuarioActual.rol || '';
      this.esInvitado = false;
    } else {
      this.esInvitado = true;
    }
    this.cargandoDatos = false;
  }

  async editarApodo() {
    const alert = await this.alertController.create({
      header: 'Personalizar Perfil',
      message: 'Elige un apodo para tu cuenta',
      inputs: [
        {
          name: 'nuevoApodo',
          type: 'text',
          placeholder: 'Ej: MochileroPro',
          value: this.apodo
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.nuevoApodo && this.uid) {
              try {
                await this.databaseService.actualizarUsuario(this.uid, { apodo: data.nuevoApodo });
                this.apodo = data.nuevoApodo;
              } catch (error) {
                console.error('Error guardando apodo:', error);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async cerrarSesion() {
    // 1. Cerramos la sesión en Firebase
    await this.authService.logout();
    
    // 2. LA SOLUCIÓN: Usamos window.location.replace en lugar del router de Angular.
    // Esto borra el caché de la memoria al recargar la app y te lanza al login limpiecito.
    window.location.replace('/vistas/login');
  }
}