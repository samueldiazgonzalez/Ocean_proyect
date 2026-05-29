import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonButtons, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonBadge, 
  IonPopover, IonList, IonItem, IonBackButton
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth'; 
import { addIcons } from 'ionicons';
import { cashOutline, arrowForwardOutline, star, water, search, notificationsOutline, personCircleOutline, heartOutline, heart, searchOutline, compassOutline, personOutline, optionsOutline, waterOutline, gridOutline, checkmark, leafOutline, peopleOutline, flameOutline, bookOutline, flowerOutline, ribbonOutline, businessOutline, briefcaseOutline } from 'ionicons/icons';
import { DatabaseService } from '../../core/services/database';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonButton, IonButtons, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonBadge,
    CommonModule, FormsModule, RouterModule, IonPopover, IonList, IonItem, IonBackButton
  ]
})
export class CatalogoPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer); // ✅ NUEVO

  @ViewChild('popoverFiltros') popover!: IonPopover;

  tours: any[] = []; 
  toursFiltrados: any[] = []; 
  cargando: boolean = true;
  
  categoriaSeleccionada: string = 'todos';
  textoBusqueda: string = '';
  tipoInventario: string = 'aventuras'; 
  rol: string = 'viajero';
  isHeaderHidden: boolean = false;
  private lastScrollPosition = 0;

  // ✅ VARIABLES DEL VIDEO HERO
  mostrarImagenHero: boolean = false;
  reproduccionesHero: number = 0;
  reproduccionesMaximas: number = 3;
  youtubeHeroUrl!: SafeResourceUrl;
  private heroPlayer: any;

  constructor() {
    addIcons({
      waterOutline, heartOutline, notificationsOutline, personOutline,
      searchOutline, optionsOutline, gridOutline, checkmark, leafOutline,
      peopleOutline, flameOutline, bookOutline, flowerOutline, ribbonOutline,
      businessOutline, compassOutline, star, cashOutline, arrowForwardOutline,
      water, personCircleOutline, search, heart, briefcaseOutline
    });
  }

  async ngOnInit() {
    // ✅ Generar URL segura del video
    this.youtubeHeroUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/UYea7UOs_es?autoplay=1&mute=1&controls=0&enablejsapi=1&playsinline=1&rel=0&showinfo=0'
    );

    // ✅ Cargar la API de YouTube
    this.cargarYouTubeAPI();

    const usuario = await this.authService.obtenerDatosUsuarioActual();
    if (usuario) {
      this.rol = usuario.rol;
    }
  }

  // ✅ Carga el script de YouTube una sola vez
  cargarYouTubeAPI() {
    if ((window as any)['YT']?.Player) {
      this.iniciarHeroPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    (window as any)['onYouTubeIframeAPIReady'] = () => {
      this.iniciarHeroPlayer();
    };
  }

  // ✅ Inicializa el player y escucha cuando termina el video
  iniciarHeroPlayer() {
    setTimeout(() => {
      this.heroPlayer = new (window as any)['YT'].Player('hero-youtube-player', {
        events: {
          onStateChange: (event: any) => {
            if (event.data === 0) { // 0 = video terminó
              this.onHeroVideoEnded();
            }
          }
        }
      });
    }, 1000); // Pequeño delay para asegurar que el iframe esté en el DOM
  }

  // ✅ Controla las repeticiones
  onHeroVideoEnded() {
    this.reproduccionesHero++;

    if (this.reproduccionesHero < this.reproduccionesMaximas) {
      this.heroPlayer.seekTo(0);
      this.heroPlayer.playVideo();
    } else {
      this.mostrarImagenHero = true; // Muestra la imagen estática
    }
  }

  navegar(ruta: string) {
    this.router.navigateByUrl(ruta);
  }

  async ionViewWillEnter() {
    this.cargarCatalogo();
  }

  async abrirFiltros(event: Event) {
    this.popover.event = event;
    await this.popover.present();
  }

  async cargarCatalogo() {
    this.cargando = true;
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    this.databaseService.obtenerTours().subscribe({
      next: (data) => {
        this.tours = data;
        
        if (usuarioActual && usuarioActual.uid) {
          this.databaseService.obtenerFavoritosPorTurista(usuarioActual.uid).subscribe(favoritos => {
            const idsFavoritos = favoritos.map((f: any) => f.tourId);
            this.tours.forEach(tour => {
              tour.esFavorito = idsFavoritos.includes(tour.id);
            });
          });
        }

        this.tours.forEach(tour => {
          if (tour.id) {
            this.databaseService.obtenerResenasPorTour(tour.id).subscribe(resenas => {
              if (resenas.length > 0) {
                const suma = resenas.reduce((acc: any, r: any) => acc + r.calificacion, 0);
                tour.promedioEstrellas = (suma / resenas.length).toFixed(1);
                tour.totalResenas = resenas.length;
              } else {
                tour.promedioEstrellas = 0;
                tour.totalResenas = 0;
              }
            });
          }
        });

        this.toursFiltrados = [...this.tours];
        this.filtrarTours(); 
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el catálogo', err);
        this.cargando = false;
      }
    });
  }

  async toggleFavorito(tour: any, event?: Event) {
    if (event) event.stopPropagation();

    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (!usuarioActual || !usuarioActual.uid) {
      alert('❤️ Debes iniciar sesión como Turista para guardar tus lugares favoritos.');
      return;
    }

    const estadoAnterior = !!tour.esFavorito;
    tour.esFavorito = !estadoAnterior;

    try {
      await this.databaseService.alternarFavorito(usuarioActual.uid, tour.id, estadoAnterior);
    } catch (error) {
      console.error('Error al sincronizar el favorito', error);
      tour.esFavorito = estadoAnterior;
    }
  }
  
  cambiarTipoInventario(event: any) {
    this.tipoInventario = event.detail.value;
    this.categoriaSeleccionada = 'todos';
    this.textoBusqueda = '';
    this.filtrarTours();
  }

  filtrarTours() {
    let temp = [...this.tours];

    if (this.tipoInventario === 'hoteles') {
      temp = temp.filter(tour => tour.categoria && tour.categoria.toLowerCase().trim() === 'hoteles');
    } else {
      temp = temp.filter(tour => !tour.categoria || tour.categoria.toLowerCase().trim() !== 'hoteles');
    }

    if (this.categoriaSeleccionada !== 'todos') {
      temp = temp.filter(tour => 
        tour.categoria && 
        tour.categoria.toLowerCase().trim() === this.categoriaSeleccionada.toLowerCase().trim()
      );
    }

    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      const termino = this.textoBusqueda.toLowerCase().trim();
      temp = temp.filter(tour => 
        (tour.titulo && tour.titulo.toLowerCase().includes(termino)) || 
        (tour.descripcion && tour.descripcion.toLowerCase().includes(termino))
      );
    }

    this.toursFiltrados = temp;
  }

  cambiarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.filtrarTours();
    if (this.popover) this.popover.dismiss();
  }

  buscar(event: any) {
    this.textoBusqueda = event.detail.value;
    this.filtrarTours();
  }

  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.categoriaSeleccionada = 'todos';
    this.toursFiltrados = [...this.tours];
    this.filtrarTours();
  }

  handleScroll(event: any) {
    const currentScrollPosition = event.detail.scrollTop;
    if (currentScrollPosition > 100 && currentScrollPosition > this.lastScrollPosition) {
      this.isHeaderHidden = true;
    } else if (currentScrollPosition < this.lastScrollPosition) {
      this.isHeaderHidden = false;
    }
    this.lastScrollPosition = currentScrollPosition;
  }
}