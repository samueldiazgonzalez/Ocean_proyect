import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonList, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

import { CardService } from '../../core/services/card';
import { ToastService } from '../../core/services/toast';
import { DatabaseService } from '../../core/services/database'; 
import { Haptics, ImpactStyle } from '@capacitor/haptics';
// 👇 1. IMPORTAMOS EL PLUGIN DE BIOMETRÍA 👇
import { NativeBiometric } from '@capgo/capacitor-native-biometric'; 

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonList, IonSpinner,
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

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline });
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
      // 1. Vibración nativa
      await Haptics.impact({ style: ImpactStyle.Medium });

      // 👇 2. VERIFICACIÓN BIOMÉTRICA 👇
      const biometria = await NativeBiometric.isAvailable();
      
      if (biometria.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Autoriza el pago de tu reserva en Ocean",
          title: "Confirmar Pago",
          subtitle: "Seguridad de la transacción",
          description: "Usa tu huella dactilar o Face ID para procesar la tarjeta."
        });
      }
      // 👆 FIN DE VERIFICACIÓN 👆

      // 3. Armamos los datos para actualizar el recibo
      const datosActualizados = {
        estado: 'CONFIRMADA',
        metodoPago: 'TARJETA_CREDITO',
        franquiciaTarjeta: this.franquicia,
        ultimosDigitos: this.numeroTarjeta.slice(-4)
      };

      // 4. Actualizamos en Firebase
      await this.databaseService.actualizarReserva(this.reservaId, datosActualizados);

      // 5. Éxito y redirección
      this.toastService.mostrarMensaje('¡Pago aprobado! Reserva confirmada.', 'success');
      
      setTimeout(() => {
        this.cargando = false;
        this.router.navigate(['/mis-reservas']);
      }, 1500);

    } catch (error: any) {
      this.cargando = false;
      // 👇 Si el usuario cancela la huella, mostramos un mensaje distinto 👇
      if (error.message && (error.message.toLowerCase().includes('cancel') || error.message.toLowerCase().includes('user'))) {
        this.toastService.mostrarMensaje('Pago cancelado por el usuario', 'warning');
      } else {
        this.toastService.mostrarMensaje('Error procesando el pago', 'danger');
      }
    }
  }
}