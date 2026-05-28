import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonList, IonSpinner, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, checkmarkCircle } from 'ionicons/icons';

import { CardService } from '../../core/services/card';
import { ToastService } from '../../core/services/toast';
import { DatabaseService } from '../../core/services/database'; 
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { NativeBiometric } from '@capgo/capacitor-native-biometric'; 

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonList, IonSpinner, IonModal,
    CommonModule, FormsModule
  ]
})
export class CheckoutPage implements OnInit {
  private cardService = inject(CardService);
  private toastService = inject(ToastService);
  private databaseService = inject(DatabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reservaId: string | null = null;
  
  numeroTarjeta: string = '';
  fechaExpiracion: string = '';
  cvv: string = '';
  nombreTitular: string = '';

  franquicia: string = 'desconocida';
  esValida: boolean = false;
  cargando: boolean = false;
  
  mostrarTicket: boolean = false;
  qrUrlGenerado: string = '';

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, checkmarkCircle });
  }

  async ngOnInit() {
    this.reservaId = this.route.snapshot.paramMap.get('id');
    
    if (!this.reservaId) {
      this.toastService.mostrarMensaje('Error: Reserva no encontrada', 'danger');
      this.router.navigate(['/mis-reservas']);
    }
  }

  verificarTarjeta() {
    this.franquicia = this.cardService.obtenerFranquicia(this.numeroTarjeta);
    const numLimpio = this.numeroTarjeta.replace(/\s/g, '');
    this.esValida = numLimpio.length >= 15 ? this.cardService.validarLuhn(numLimpio) : false;
  }

  formatearExpiracion() {
    if (this.fechaExpiracion.length === 2 && !this.fechaExpiracion.includes('/')) {
      this.fechaExpiracion += '/';
    }
  }

  async procesarPago() {
    if (!this.esValida || !this.fechaExpiracion || !this.cvv || !this.nombreTitular) {
      this.toastService.mostrarMensaje('Completa todos los datos correctamente.', 'warning');
      return;
    }

    if (!this.reservaId) return;

    this.cargando = true;

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });

      const biometria = await NativeBiometric.isAvailable();
      
      if (biometria.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Autoriza el pago de tu reserva en Ocean",
          title: "Confirmar Pago",
          subtitle: "Seguridad de la transacción",
          description: "Usa tu huella dactilar o Face ID para procesar la tarjeta."
        });
      }

      const datosActualizados = {
        estado: 'CONFIRMADA',
        metodoPago: 'TARJETA_CREDITO',
        franquiciaTarjeta: this.franquicia,
        ultimosDigitos: this.numeroTarjeta.slice(-4)
      };

      await this.databaseService.actualizarReserva(this.reservaId, datosActualizados);
      
      const textoQr = `OCEAN-${this.reservaId}-${this.nombreTitular.replace(' ', '')}`;
      this.qrUrlGenerado = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(textoQr)}&color=3880ff`;

      this.cargando = false;
      this.mostrarTicket = true;

    } catch (error: any) {
      this.cargando = false;
      if (error.message && (error.message.toLowerCase().includes('cancel') || error.message.toLowerCase().includes('user'))) {
        this.toastService.mostrarMensaje('Pago cancelado por el usuario', 'warning');
      } else {
        this.toastService.mostrarMensaje('Error procesando el pago', 'danger');
      }
    }
  }

  finalizarYSalir() {
    this.mostrarTicket = false;
    this.router.navigate(['/tabs/mis-reservas']);
  }
}