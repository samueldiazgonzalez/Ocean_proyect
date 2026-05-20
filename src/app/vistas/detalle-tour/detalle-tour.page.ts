import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonSpinner, IonButton, IonIcon, IonText, IonBadge,
  IonFooter, IonRow, IonCol 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { logoWhatsapp, cashOutline, mapOutline, cardOutline } from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database'; 
import { AuthService } from '../../core/services/auth'; // <-- Importamos Auth
import { Tour } from '../../core/models/tour.model';

@Component({
  selector: 'app-detalle-tour',
  templateUrl: './detalle-tour.page.html',
  styleUrls: ['./detalle-tour.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonSpinner, IonButton, IonIcon, IonText, IonBadge,
    IonFooter, IonRow, IonCol, 
    CommonModule, FormsModule, RouterModule 
  ]
})
export class DetalleTourPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router); // <-- Para navegar a mis-reservas
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService); // <-- Para saber quién compra

  tour: Tour | null = null;
  cargando: boolean = true;
  procesandoReserva: boolean = false; // <-- Para mostrar un spinner en el botón

  constructor() { 
    addIcons({logoWhatsapp, cardOutline, cashOutline, mapOutline});
  }

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    if (tourId) {
      this.tour = await this.databaseService.obtenerTourPorId(tourId);
    }
    this.cargando = false;
  }

  abrirWhatsApp() {
    const telefonoAgencia = '573001234567'; 
    const tituloDelTour = this.tour ? this.tour.titulo : 'este paquete turístico';
    const mensaje = `¡Hola! Vi tu "${tituloDelTour}" en la app Ocean 🌊 y me gustaría hacer una reserva.`;
    const url = `https://wa.me/${telefonoAgencia}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // 👇 NUEVA FUNCIÓN PARA APARTAR EL CUPO 👇
  async apartarCupo() {
    if (!this.tour) return;

    this.procesandoReserva = true;

    try {
      const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

      // Si es un invitado, el Guard lo mandará al login (ya lo configuramos para la ruta de checkout, pero acá lo hacemos manual)
      if (!usuarioActual) {
        this.router.navigate(['/vistas/login']);
        return;
      }

      // Creamos el ticket PENDIENTE
      const nuevaReserva = {
        tourId: this.tour.id,
        turistaId: usuarioActual.uid,
        fechaReserva: new Date().toISOString(),
        estado: 'PENDIENTE', // <-- ¡La clave está aquí!
        metodoPago: 'POR DEFINIR'
      };

      await this.databaseService.crearReserva(nuevaReserva);
      
      // Lo mandamos a su historial para que vea su reserva pendiente
      this.router.navigate(['/mis-reservas']);

    } catch (error) {
      console.error('Error al apartar cupo:', error);
    } finally {
      this.procesandoReserva = false;
    }
  }
}