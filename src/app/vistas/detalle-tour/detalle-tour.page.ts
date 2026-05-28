import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonSpinner, IonButton, IonIcon, IonText, IonBadge,
  IonFooter, IonRow, IonCol, IonList, IonItem, IonLabel, IonTextarea 
} from '@ionic/angular/standalone';
import { Share } from '@capacitor/share'; 
import { addIcons } from 'ionicons';
import { 
  logoWhatsapp, cashOutline, mapOutline, cardOutline, 
  star, starOutline, personCircleOutline, chatbubblesOutline, lockClosedOutline,
  pricetagOutline, timeOutline, checkmarkCircleOutline, imagesOutline,
  heart, heartOutline, location, informationCircleOutline,
  radioButtonOn, radioButtonOff, checkboxOutline, squareOutline, bedOutline, peopleOutline, shareSocialOutline, checkmarkCircle
} from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database'; 
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment'; 

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
export class DetalleTourPage implements OnInit, AfterViewInit {

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router); 
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService); 

  tour: any = null; 
  cargando: boolean = true;
  procesandoReserva: boolean = false; 

  usuarioActual: any = null;
  resenas: any[] = [];
  promedioEstrellas: number = 0;
  nuevaEstrellas: number = 0;
  nuevoComentario: string = '';
  
  // Google Maps
  mapa: any = null;
  googleMapLoaded: boolean = false;
  enviandoResena: boolean = false;
  puedeCalificar: boolean = false;

  fotoSeleccionada: string = '';
  esFavorito: boolean = false;
  showStickyHeader = false;

  precioCalculado: number = 0;
  habitacionSeleccionada: any = null;

  constructor() { 
    addIcons({
      shareSocialOutline,star,timeOutline,location,mapOutline,informationCircleOutline,peopleOutline,
      checkmarkCircleOutline,personCircleOutline,logoWhatsapp,cardOutline,cashOutline,starOutline,
      chatbubblesOutline,lockClosedOutline,pricetagOutline,imagesOutline,heart,heartOutline,
      radioButtonOn,radioButtonOff,checkboxOutline,squareOutline,bedOutline, checkmarkCircle
    });
  }

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    this.usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (tourId) {
      this.tour = await this.databaseService.obtenerTourPorId(tourId);
      
      if (this.tour) {
        this.fotoSeleccionada = this.tour.imagenUrl;
        this.cargarResenas(tourId);
        
        if (this.tour.categoria !== 'hoteles') {
          this.precioCalculado = this.tour.precio;
          if (this.tour.extras) {
            this.tour.extras.forEach((e: any) => e.seleccionado = false);
          }
        } else {
          this.precioCalculado = 0; 
        }

        if (this.usuarioActual) {
          this.verificarSiPuedeCalificar();
          this.verificarSiEsFavorito(); 
        }

        setTimeout(() => {
          this.initMap();
        }, 500);
      }
    }
    this.cargando = false;
  }

  seleccionarHabitacion(hab: any) {
    this.habitacionSeleccionada = hab;
    this.precioCalculado = hab.precio;
  }

  toggleExtra(extra: any) {
    extra.seleccionado = !extra.seleccionado;
    let base = this.tour.precio || 0;
    let costoExtras = 0;
    this.tour.extras.forEach((e: any) => {
      if (e.seleccionado) costoExtras += e.precio;
    });
    this.precioCalculado = base + costoExtras;
  }

  puedeReservar(): boolean {
    if (this.tour?.categoria === 'hoteles' && !this.habitacionSeleccionada) {
      return false;
    }
    return true;
  }

  verificarSiEsFavorito() {
    if (!this.usuarioActual || !this.tour) return;
    this.databaseService.obtenerFavoritosPorTurista(this.usuarioActual.uid).subscribe(favoritos => {
      this.esFavorito = favoritos.some(fav => fav.tourId === this.tour.id);
    });
  }

  async toggleFavorito() {
    if (!this.usuarioActual) {
      this.router.navigate(['/vistas/login']);
      return;
    }
    try {
      this.esFavorito = !this.esFavorito;
      await this.databaseService.alternarFavorito(this.usuarioActual.uid, this.tour.id, !this.esFavorito);
    } catch (error) {
      this.esFavorito = !this.esFavorito;
    }
  }

  cambiarFoto(url: string) { this.fotoSeleccionada = url; }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showStickyHeader = scrollTop > 300; 
  }

  ngAfterViewInit() {
    if (this.tour?.latitud && this.tour?.longitud) {
      this.initMap();
    }
  }

  initMap() {
    if (!this.tour?.latitud || !this.tour?.longitud) return;
    if (!this.mapContainer) return;

    if (!(window as any).google) {
      this.loadGoogleMapsAPI();
      return;
    }

    this.createMap();
  }

  private loadGoogleMapsAPI() {
    const googleMapsApiKey = environment.googleMapsApiKey;
    const scriptId = 'google-maps-script';
    
    if (document.getElementById(scriptId)) {
      this.createMap();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
    script.onload = () => {
      this.googleMapLoaded = true;
      this.createMap();
    };
    document.head.appendChild(script);
  }

  private createMap() {
    if (!this.tour?.latitud || !this.tour?.longitud) return;
    if (!this.mapContainer) return;

    const location = { lat: this.tour.latitud, lng: this.tour.longitud };

    this.mapa = new (window as any).google.maps.Map(
      this.mapContainer.nativeElement,
      { zoom: 15, center: location, mapTypeControl: true, fullscreenControl: true }
    );

    const marker = new (window as any).google.maps.Marker({
      position: location,
      map: this.mapa,
      title: this.tour.titulo,
      icon: 'https://maps.google.com/mapfiles/ms/micons/red-dot.png'
    });

    const infoWindow = new (window as any).google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px;">${this.tour.titulo}</h3>
          <p style="margin: 0 0 5px 0; font-size: 12px;">${this.tour.direccion || 'Ubicación del tour'}</p>
          <p style="margin: 0; font-size: 12px; color: #3880ff;"><strong>$${this.tour.precio} COP</strong></p>
        </div>
      `
    });

    marker.addListener('click', () => { infoWindow.open(this.mapa, marker); });
    infoWindow.open(this.mapa, marker);
  }

  verificarSiPuedeCalificar() {
    if (!this.usuarioActual || !this.tour) return;
    this.databaseService.obtenerReservasPorTurista(this.usuarioActual.uid).subscribe(reservas => {
      const reservaValida = reservas.find(r => r.tourId === this.tour!.id && r.estado === 'CONFIRMADA');
      this.puedeCalificar = !!reservaValida; 
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

  setEstrellas(cantidad: number) { this.nuevaEstrellas = cantidad; }

  async enviarResena() {
    if (!this.usuarioActual || !this.puedeCalificar) return;
    if (this.nuevaEstrellas === 0 || this.nuevoComentario.trim() === '' || !this.tour?.id) return;
    this.enviandoResena = true;
    try {
      const nombreUser = this.usuarioActual.apodo || this.usuarioActual.nombre || 'Turista';
      await this.databaseService.agregarResena(this.tour.id, this.usuarioActual.uid, nombreUser, this.nuevaEstrellas, this.nuevoComentario);
      this.nuevaEstrellas = 0;
      this.nuevoComentario = '';
    } catch (error) {
      console.error(error);
    } finally {
      this.enviandoResena = false;
    }
  }

  abrirWhatsApp() {
    if (!this.tour) return;
    let numero = this.tour.telefonoContacto || this.tour.telefono || this.tour.celular;
    if (!numero) numero = '573001234567'; 
    const numeroLimpio = numero.toString().replace(/\D/g, '');
    const tituloDelTour = this.tour.titulo || 'este paquete';
    const mensaje = `¡Hola! Vi tu "${tituloDelTour}" en la app Ocean 🌊 y me gustaría hacer una reserva.`;
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  abrirMapas() {
    if (!this.tour || !this.tour.direccion) return;
    const busqueda = encodeURIComponent(`${this.tour.direccion}, Cartagena, Colombia`);
    const url = `http://maps.google.com/?q=${busqueda}`;
    window.open(url, '_blank');
  }

  async compartirTour() {
    if (!this.tour) return;
    try {
      await Share.share({
        title: this.tour.titulo,
        text: `¡Mira esta increíble experiencia en Ocean! ${this.tour.titulo} por solo $${this.tour.precio} COP. ¿Vamos? 🏖️`,
        url: 'https://ocean-app.com/',
        dialogTitle: 'Compartir aventura con amigos',
      });
    } catch (error) {}
  }

  async apartarCupo() {
    if (!this.tour || !this.puedeReservar()) return;
    this.procesandoReserva = true;

    try {
      if (!this.usuarioActual) {
        this.router.navigate(['/vistas/login']);
        return;
      }

      const opcionesEscogidas = this.tour.extras ? this.tour.extras.filter((e:any) => e.seleccionado).map((e:any) => e.nombre) : [];

      const nuevaReserva = {
        tourId: this.tour.id,
        turistaId: this.usuarioActual.uid,
        fechaReserva: new Date().toISOString(),
        estado: 'PENDIENTE', 
        metodoPago: 'POR DEFINIR',
        precioTotal: this.precioCalculado,
        habitacion: this.habitacionSeleccionada ? this.habitacionSeleccionada.nombre : null,
        extrasSeleccionados: opcionesEscogidas
      };

      await this.databaseService.crearReserva(nuevaReserva);
      this.router.navigate(['/tabs/mis-reservas']);

    } catch (error) {
      console.error('Error al apartar cupo:', error);
    } finally {
      this.procesandoReserva = false;
    }
  }
}