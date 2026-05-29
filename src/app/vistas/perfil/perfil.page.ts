import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonSpinner,
  IonBadge, IonListHeader, IonCard, AlertController,
  IonButtons, IonBackButton, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircle, briefcaseOutline, settingsOutline, 
  helpCircleOutline, logOutOutline, ticketOutline,
  logInOutline, personAddOutline, shieldCheckmark, heartOutline,
  pencilOutline, chevronForwardOutline, swapHorizontalOutline,
  closeCircle
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
    IonBadge, IonListHeader, IonCard, IonButtons, IonBackButton, IonModal,
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

  mostrarConfig: boolean = false;
  correoUsuario: string = '';
  compania: string = ''; // 👈 Añadimos la variable para guardar la compañía

  constructor() {
    addIcons({ 
      personCircle, briefcaseOutline, settingsOutline, 
      helpCircleOutline, logOutOutline, ticketOutline,
      logInOutline, personAddOutline, shieldCheckmark, heartOutline,
      pencilOutline, chevronForwardOutline, swapHorizontalOutline,
      closeCircle
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
      this.correoUsuario = usuarioActual.email || '';
      this.compania = (usuarioActual as any).compania || ''; // 👈 Leemos si ya tiene compañía guardada
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

  abrirConfiguracion() {
    this.mostrarConfig = true;
  }

  cerrarConfiguracion() {
    this.mostrarConfig = false;
  }

  async iniciarCambioRol() {
    this.cerrarConfiguracion();

    if (this.rol === 'viajero') {
      
      // 👇 MAGIA AQUÍ: Comprobamos si YA TIENE una compañía registrada
      if (this.compania && this.compania.trim() !== '') {
        // Ya es agencia, solo confirmamos el regreso
        const alert = await this.alertController.create({
          header: 'Modo Agencia',
          message: `Vas a volver a operar como **${this.compania}**. Tus tours y datos están a salvo.`,
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Confirmar',
              handler: async () => {
                await this.ejecutarCambioRol('proveedor');
              }
            }
          ]
        });
        await alert.present();
        
      } else {
        // Es la primera vez, le pedimos el nombre de la compañía
        const alert = await this.alertController.create({
          header: 'Convertirse en Agencia',
          message: `Vas a vincular tu cuenta actual (${this.correoUsuario}) para operar como Proveedor. Por favor, ingresa el nombre de tu compañía o agencia.`,
          inputs: [
            {
              name: 'nombreCompania',
              type: 'text',
              placeholder: 'Ej: Ocean Tours S.A.S'
            }
          ],
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Confirmar',
              handler: async (data) => {
                if (!data.nombreCompania || data.nombreCompania.trim() === '') {
                  return false; 
                }
                await this.ejecutarCambioRol('proveedor', data.nombreCompania);
                return true;
              }
            }
          ]
        });
        await alert.present();
      }

    } else {
      // De proveedor a viajero
      const alert = await this.alertController.create({
        header: 'Cambiar a Turista',
        message: `Vas a usar tu cuenta en modo explorador. Tus tours como agencia seguirán guardados en el sistema.`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: async () => {
              await this.ejecutarCambioRol('viajero');
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async ejecutarCambioRol(nuevoRol: string, nombreCompania?: string) {
    if (!this.uid) return;
    this.cargandoDatos = true;
    
    try {
      const userRef = doc(this.firestore, `usuarios/${this.uid}`);
      let updateData: any = { rol: nuevoRol };
      
      // Si nos pasaron un nombre nuevo, lo guardamos
      if (nombreCompania) {
        updateData.compania = nombreCompania;
      }

      await updateDoc(userRef, updateData);
      
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