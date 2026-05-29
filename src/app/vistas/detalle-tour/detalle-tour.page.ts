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
  heart, heartOutline, informationCircleOutline, shareSocialOutline,
  checkmarkCircle
} from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database'; 
import { AuthService } from '../../core/services/auth'; 

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
  
  // 👇 Nueva variable para saber si el tour le gusta al usuario
  esFavorito: boolean = false;
  showStickyHeader = false;
  
  // Habitaciones y extras
  habitacionSeleccionada: any = null;
  extrasSeleccionados: any[] = [];

  constructor() { 
    addIcons({
      logoWhatsapp, cardOutline, cashOutline, mapOutline, 
      star, starOutline, personCircleOutline, chatbubblesOutline, lockClosedOutline,
      pricetagOutline, timeOutline, checkmarkCircleOutline, imagesOutline,
      heart, heartOutline, informationCircleOutline, shareSocialOutline,
      checkmarkCircle
    });
  }

  get precioCalculado(): number {
    let precio = this.tour?.precio || 0;
    
    if (this.habitacionSeleccionada?.precio) {
      precio = this.habitacionSeleccionada.precio;
    }
    
    if (this.extrasSeleccionados.length > 0) {
      const extrasCosto = this.extrasSeleccionados.reduce((sum: number, extra: any) => sum + (extra.precio || 0), 0);
      precio += extrasCosto;
    }
    
    return precio;
  }

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    this.usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (tourId) {
      this.tour = await this.databaseService.obtenerTourPorId(tourId);
      
      if (this.tour) {
        this.fotoSeleccionada = this.tour.imagenUrl;
        this.cargarResenas(tourId);
        
        if (this.usuarioActual) {
          this.verificarSiPuedeCalificar();
          this.verificarSiEsFavorito(); // 👈 Verificamos si ya le había dado like
        }

        // Inicializar mapa después de un pequeño delay para que el DOM esté listo
        setTimeout(() => {
          this.initMap();
        }, 500);
      }
    }
    this.cargando = false;
  }

  // 👇 LÓGICA DE FAVORITOS 👇
  verificarSiEsFavorito() {
    if (!this.usuarioActual || !this.tour) return;
    
    this.databaseService.obtenerFavoritosPorTurista(this.usuarioActual.uid).subscribe(favoritos => {
      // Si el ID de este tour está en su lista de favoritos, prendemos el corazón
      this.esFavorito = favoritos.some(fav => fav.tourId === this.tour.id);
    });
  }

  async toggleFavorito() {
    if (!this.usuarioActual) {
      // Si es invitado, lo mandamos a loguearse
      this.router.navigate(['/vistas/login']);
      return;
    }

    try {
      // Cambiamos visualmente rápido para que no se sienta lag
      this.esFavorito = !this.esFavorito;
      await this.databaseService.alternarFavorito(this.usuarioActual.uid, this.tour.id, !this.esFavorito);
    } catch (error) {
      console.error('Error al guardar favorito', error);
      // Revertimos si falla
      this.esFavorito = !this.esFavorito;
    }
  }
  // 👆 FIN LÓGICA FAVORITOS 👆

  cambiarFoto(url: string) {
    this.fotoSeleccionada = url;
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showStickyHeader = scrollTop > 300; // Mostrar sticky después de 300px
  }

  ngAfterViewInit() {
    if (this.tour?.latitud && this.tour?.longitud) {
      this.initMap();
    }
  }

  initMap() {
    if (!this.tour?.latitud || !this.tour?.longitud) return;
    if (!this.mapContainer) return;

    // Verificar si Google Maps ya está cargado
    if (!(window as any).google) {
      console.warn('Google Maps no está disponible. Asegúrate de cargar la API.');
      // Cargar dinámicamente desde CDN
      this.loadGoogleMapsAPI();
      return;
    }

    this.createMap();
  }

  private loadGoogleMapsAPI() {
    const googleMapsApiKey = 'AIzaSyBCJHWSgi-srjvvI-Pw-ERdGp53ZhGPlGo';
    const scriptId = 'google-maps-script';
    
    // Evitar cargar el script múltiples veces
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
    script.onerror = () => {
      console.error('Error al cargar Google Maps. Verifica tu API key.');
    };
    document.head.appendChild(script);
  }

  private createMap() {
    if (!this.tour?.latitud || !this.tour?.longitud) return;
    if (!this.mapContainer) return;

    const location = {
      lat: this.tour.latitud,
      lng: this.tour.longitud
    };

    this.mapa = new (window as any).google.maps.Map(
      this.mapContainer.nativeElement,
      {
        zoom: 15,
        center: location,
        mapTypeControl: true,
        fullscreenControl: true,
      }
    );

    // Agregar marcador
    const marker = new (window as any).google.maps.Marker({
      position: location,
      map: this.mapa,
      title: this.tour.titulo,
      icon: 'https://maps.google.com/mapfiles/ms/micons/red-dot.png'
    });

    // Agregar info window (popup)
    const infoWindow = new (window as any).google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px;">${this.tour.titulo}</h3>
          <p style="margin: 0 0 5px 0; font-size: 12px;">${this.tour.direccion || 'Ubicación del tour'}</p>
          <p style="margin: 0; font-size: 12px; color: #3880ff;"><strong>$${this.tour.precio} COP</strong></p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(this.mapa, marker);
    });

    // Abrir info window por defecto
    infoWindow.open(this.mapa, marker);
  }

  verificarSiPuedeCalificar() {
    if (!this.usuarioActual || !this.tour) return;

    this.databaseService.obtenerReservasPorTurista(this.usuarioActual.uid).subscribe(reservas => {
      // Cambiamos a 'CONFIRMADA' para que coincida con el checkout biométrico
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

  setEstrellas(cantidad: number) {
    this.nuevaEstrellas = cantidad;
  }

  async enviarResena() {
    if (!this.usuarioActual || !this.puedeCalificar) return;
    if (this.nuevaEstrellas === 0 || this.nuevoComentario.trim() === '' || !this.tour?.id) return;

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
    const telefonoAgencia = this.tour?.telefono || this.tour?.telefonoContacto || '573000000000'; 
    const tituloDelTour = this.tour ? this.tour.titulo : 'este paquete turístico';
    const mensaje = `¡Hola! Vi tu "${tituloDelTour}" en la app Ocean 🌊 y me gustaría hacer una reserva.`;
    const url = `https://wa.me/${telefonoAgencia}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  abrirMapas() {
    let googleMapsUrl = '';
    
    // Prioridad 1: Si tiene coordenadas exactas, usar coordenadas
    if (this.tour?.latitud && this.tour?.longitud) {
      const lat = this.tour.latitud;
      const lng = this.tour.longitud;
      const titulo = encodeURIComponent(this.tour.titulo);
      googleMapsUrl = `https://www.google.com/maps/search/${titulo}/@${lat},${lng},15z`;
    }
    // Prioridad 2: Si tiene dirección (barrio, localidad, ciudad), buscar por eso
    else if (this.tour?.direccion) {
      const direccion = encodeURIComponent(this.tour.direccion);
      googleMapsUrl = `https://www.google.com/maps/search/${direccion}`;
    }
    // Prioridad 3: Buscar por título del tour
    else if (this.tour?.titulo) {
      const titulo = encodeURIComponent(this.tour.titulo);
      googleMapsUrl = `https://www.google.com/maps/search/${titulo}`;
    }
    else {
      console.warn('No hay información de ubicación disponible');
      return;
    }
    
    // Abrir en Google Maps
    window.open(googleMapsUrl, '_blank');
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
    } catch (error) {
      console.error('Error al abrir el menú de compartir', error);
    }
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

  puedeReservar(): boolean {
    return !!this.usuarioActual;
  }

  seleccionarHabitacion(habitacion: any) {
    this.habitacionSeleccionada = habitacion;
  }

  toggleExtra(extra: any) {
    const index = this.extrasSeleccionados.indexOf(extra);
    if (index > -1) {
      this.extrasSeleccionados.splice(index, 1);
    } else {
      this.extrasSeleccionados.push(extra);
    }
  }

  isExtraSelected(extra: any): boolean {
    return this.extrasSeleccionados.includes(extra);
  }
}