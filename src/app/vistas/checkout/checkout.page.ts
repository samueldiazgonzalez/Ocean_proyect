import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonList, IonSpinner, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';

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
  
  // Datos crudos
  numeroTarjeta: string = '';
  fechaExpiracion: string = '';
  cvv: string = '';
  nombreTitular: string = '';

  // Datos para la visualización bonita
  numeroTarjetaVisual: string = '';
  isFlipped: boolean = false; 

  franquicia: string = 'desconocida';
  esValida: boolean = false;
  cargando: boolean = false;
  
  mostrarTicket: boolean = false;
  qrUrlGenerado: string = '';

  constructor() {
    addIcons({checkmarkCircle, closeCircle, checkmarkCircleOutline, closeCircleOutline});
  }

  async ngOnInit() {
    this.reservaId = this.route.snapshot.paramMap.get('id');
    
    if (!this.reservaId) {
      this.toastService.mostrarMensaje('Error: Reserva no encontrada', 'danger');
      this.router.navigate(['/mis-reservas']);
    }
  }

  // ─── Lógica Visual de la Tarjeta 3D ──────────────────────────

  flipCard() {
    this.isFlipped = !this.isFlipped;
  }

  getCardClass() {
    if (this.franquicia === 'visa') return 'visa-style';
    if (this.franquicia === 'mastercard') return 'mc-style';
    return '';
  }

  formatCardNumberDisplay() {
    if (!this.numeroTarjeta) return '#### #### #### ####';
    // Rellena con # si faltan números y los separa cada 4 espacios
    let padded = this.numeroTarjeta.padEnd(16, '#');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  }

  // ─── Manejo de Inputs (Formateo automático) ──────────────────

  onCardNumberChange(value: string) {
    // 1. Quitar todo lo que no sea número
    const digits = value.replace(/\D/g, '');
    this.numeroTarjeta = digits;
    
    // 2. Ponerle los espacios para que se vea bonito en el input (Ej: 4111 1111...)
    this.numeroTarjetaVisual = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // 3. Verificar si es válida
    this.verificarTarjeta();
  }

  onExpChange(value: string) {
    // Quitar lo que no sea número y agregar el "/" automáticamente
    let clean = value.replace(/\D/g, '');
    if (clean.length > 2) {
      clean = clean.substring(0, 2) + '/' + clean.substring(2, 4);
    }
    this.fechaExpiracion = clean;
  }

  verificarTarjeta() {
    this.franquicia = this.cardService.obtenerFranquicia(this.numeroTarjeta);
    this.esValida = this.numeroTarjeta.length >= 15 ? this.cardService.validarLuhn(this.numeroTarjeta) : false;
  }

  // ─── Procesamiento y Pago ────────────────────────────────────

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
      
      const textoQr = `OCEAN-${this.reservaId}-${this.nombreTitular.replace(/\s/g, '')}`;
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