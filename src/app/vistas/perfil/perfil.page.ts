import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonSpinner,
  IonBadge, IonListHeader, IonCard, AlertController,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircle, briefcaseOutline, settingsOutline, 
  helpCircleOutline, logOutOutline, ticketOutline,
  logInOutline, personAddOutline, shieldCheckmark, heartOutline,
  pencilOutline, chevronForwardOutline, swapHorizontalOutline
} from 'ionicons/icons';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

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
    IonBadge, IonListHeader, IonCard, IonButtons, IonBackButton,
    CommonModule, FormsModule, RouterModule 
  ]
})
export class PerfilPage { 
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private firestore = inject(Firestore);

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
      pencilOutline, chevronForwardOutline, swapHorizontalOutline
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

  async cambiarRol() {
    if (!this.uid) return;
    
    this.cargandoDatos = true;
    const nuevoRol = this.rol === 'viajero' ? 'proveedor' : 'viajero';
    
    try {
      const userRef = doc(this.firestore, `usuarios/${this.uid}`);
      await updateDoc(userRef, { rol: nuevoRol });
      
      // 👇 MAGIA AQUÍ: Lo enviamos a su pantalla correcta según su nuevo rol
      if (nuevoRol === 'proveedor') {
        window.location.replace('/tabs/mis-tours');
      } else {
        window.location.replace('/tabs/catalogo');
      }
      
    } catch (error) {
      console.error('Error al cambiar rol', error);
      this.cargandoDatos = false;
    }
  }

  async cerrarSesion() {
    await this.authService.logout();
    window.location.replace('/vistas/login');
  }
}