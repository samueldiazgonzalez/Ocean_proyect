import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonSpinner, IonButton, IonIcon, IonText, IonBadge,
  IonFooter, IonRow, IonCol, IonList, IonItem, IonLabel, IonTextarea 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  logoWhatsapp, cashOutline, mapOutline, cardOutline, 
  star, starOutline, personCircleOutline, chatbubblesOutline, lockClosedOutline
} from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database'; 
import { AuthService } from '../../core/services/auth'; 
import { Tour } from '../../core/models/tour.model';

@Component({
  selector: 'app-detalle-tour',
  templateUrl: './detalle-tour.page.html',
  styleUrls: ['./detalle-tour.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonSpinner, IonButton, IonIcon, IonText, IonBadge,
    IonFooter, IonRow, IonCol, IonList, IonItem, IonLabel, IonTextarea,
    CommonModule, FormsModule, RouterModule 
  ]
})
export class DetalleTourPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router); 
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService); 

  tour: Tour | null = null;
  cargando: boolean = true;
  procesandoReserva: boolean = false; 

  usuarioActual: any = null;
  resenas: any[] = [];
  promedioEstrellas: number = 0;
  nuevaEstrellas: number = 0;
  nuevoComentario: string = '';
  enviandoResena: boolean = false;
  
  // 👇 Nueva variable que actúa como candado de seguridad
  puedeCalificar: boolean = false;

  constructor() { 
    addIcons({
      logoWhatsapp, cardOutline, cashOutline, mapOutline, 
      star, starOutline, personCircleOutline, chatbubblesOutline, lockClosedOutline
    });
  }

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    this.usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (tourId) {
      this.tour = await this.databaseService.obtenerTourPorId(tourId);
      this.cargarResenas(tourId);
      
      // 👇 Si el usuario inició sesión, verificamos sus compras
      if (this.usuarioActual) {
        this.verificarSiPuedeCalificar();
      }
    }
    this.cargando = false;
  }

  verificarSiPuedeCalificar() {
    if (!this.usuarioActual || !this.tour) return;

    this.databaseService.obtenerReservasPorTurista(this.usuarioActual.uid).subscribe(reservas => {
      // Buscamos si el usuario tiene una reserva de ESTE tour y que además esté 'PAGADO'
      const reservaValida = reservas.find(r => r.tourId === this.tour!.id && r.estado === 'PAGADO');
      this.puedeCalificar = !!reservaValida; // Si existe, desbloquea la caja de reseñas
    });
  }

  cargarResenas(tourId: string) {
    this.databaseService.obtenerResenasPorTour(tourId).subscribe(data => {
      this.resenas = data;
      this.calcularPromedio();
    });
  }

  calcularPromedio() {
    if (this.resenas.length === 0) {
      this.promedioEstrellas = 0;
      return;
    }
    const suma = this.resenas.reduce((acc, resena) => acc + resena.calificacion, 0);
    this.promedioEstrellas = parseFloat((suma / this.resenas.length).toFixed(1));
  }

  setEstrellas(cantidad: number) {
    this.nuevaEstrellas = cantidad;
  }

  async enviarResena() {
    if (!this.usuarioActual || !this.puedeCalificar) {
      return;
    }
    
    if (this.nuevaEstrellas === 0 || this.nuevoComentario.trim() === '' || !this.tour?.id) {
      return; 
    }

    this.enviandoResena = true;
    try {
      const nombreUser = this.usuarioActual.apodo || this.usuarioActual.nombre || 'Turista Explorador';
      
      await this.databaseService.agregarResena(
        this.tour.id, 
        this.usuarioActual.uid, 
        nombreUser, 
        this.nuevaEstrellas, 
        this.nuevoComentario
      );

      this.nuevaEstrellas = 0;
      this.nuevoComentario = '';
    } catch (error) {
      console.error(error);
    } finally {
      this.enviandoResena = false;
    }
  }

  abrirWhatsApp() {
    const telefonoAgencia = '573001234567'; 
    const tituloDelTour = this.tour ? this.tour.titulo : 'este paquete turístico';
    const mensaje = `¡Hola! Vi tu "${tituloDelTour}" en la app Ocean 🌊 y me gustaría hacer una reserva.`;
    const url = `https://wa.me/${telefonoAgencia}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  async apartarCupo() {
    if (!this.tour) return;
    this.procesandoReserva = true;

    try {
      if (!this.usuarioActual) {
        this.router.navigate(['/vistas/login']);
        return;
      }

      const nuevaReserva = {
        tourId: this.tour.id,
        turistaId: this.usuarioActual.uid,
        fechaReserva: new Date().toISOString(),
        estado: 'PENDIENTE', 
        metodoPago: 'POR DEFINIR'
      };

      await this.databaseService.crearReserva(nuevaReserva);
      this.router.navigate(['/mis-reservas']);

    } catch (error) {
      console.error('Error al apartar cupo:', error);
    } finally {
      this.procesandoReserva = false;
    }
  }
}