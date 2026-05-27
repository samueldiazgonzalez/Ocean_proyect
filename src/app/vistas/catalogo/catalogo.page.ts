import { Component, OnInit, inject, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonButtons, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonBadge, 
  IonPopover, IonList, IonItem,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth'; 

import { addIcons } from 'ionicons';
import { cashOutline, arrowForwardOutline, star, water, search, notificationsOutline, personCircleOutline, heartOutline, heart, searchOutline, compassOutline, personOutline, optionsOutline, waterOutline, gridOutline, checkmark, leafOutline, peopleOutline, flameOutline, bookOutline, flowerOutline, ribbonOutline, businessOutline } from 'ionicons/icons';
import { DatabaseService } from '../../core/services/database';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonButton,IonButtons, IonIcon, IonGrid, IonRow, IonCol, IonSpinner,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonBadge,
    CommonModule, FormsModule, RouterModule, IonPopover, IonList, IonItem
  ]
})
export class CatalogoPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  @ViewChild('popoverFiltros') popover!: IonPopover;

  tours: any[] = []; 
  toursFiltrados: any[] = []; 
  cargando: boolean = true;
  
  // VARIABLES DE ESTADO Y FILTROS
  categoriaSeleccionada: string = 'todos';
  textoBusqueda: string = '';
  tipoInventario: string = 'aventuras'; 

  // VARIABLES PARA EL SCROLL MÁGICO
  isHeaderHidden: boolean = false;
  private lastScrollPosition = 0;

  constructor() {
    addIcons({waterOutline,heartOutline,notificationsOutline,personOutline,searchOutline,optionsOutline,gridOutline,checkmark,leafOutline,peopleOutline,flameOutline,bookOutline,flowerOutline,ribbonOutline,businessOutline,compassOutline,star,cashOutline,arrowForwardOutline,water,personCircleOutline,search});
  }

  async ionViewWillEnter() {
    this.cargarCatalogo();
  }

  ngOnInit() {} 

  async abrirFiltros(event: Event) {
    this.popover.event = event;
    await this.popover.present();
  }

  cargarCatalogo() {
    this.cargando = true;
    this.databaseService.obtenerTours().subscribe({
      next: (data) => {
        this.tours = data;
        
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
  
  cambiarTipoInventario(event: any) {
    this.tipoInventario = event.detail.value;
    
    // Reseteamos los otros filtros para evitar conflictos visuales
    this.categoriaSeleccionada = 'todos';
    this.textoBusqueda = '';
    
    this.filtrarTours();
  }

  filtrarTours() {
    let temp = [...this.tours];

    // 1. Filtro de Pestañas (Aventuras vs Hoteles) - ¡RESTAURADO!
    if (this.tipoInventario === 'hoteles') {
      temp = temp.filter(tour => tour.categoria && tour.categoria.toLowerCase().trim() === 'hoteles');
    } else {
      temp = temp.filter(tour => !tour.categoria || tour.categoria.toLowerCase().trim() !== 'hoteles');
    }

    // 2. Filtro de Categoría del Popover (Relajante, Extremo, etc.)
    if (this.categoriaSeleccionada !== 'todos') {
      temp = temp.filter(tour => 
        tour.categoria && 
        tour.categoria.toLowerCase().trim() === this.categoriaSeleccionada.toLowerCase().trim()
      );
    }

    // 3. Filtro de Búsqueda por Texto
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
    
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  buscar(event: any) {
    this.textoBusqueda = event.detail.value;
    if (!this.textoBusqueda || this.textoBusqueda.trim() === '') {
      this.filtrarTours();
      return;
    }
    this.filtrarTours();
  }

  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.categoriaSeleccionada = 'todos';
    this.toursFiltrados = [...this.tours];
    this.filtrarTours(); 
  }

  async toggleFavorito(tour: any) {
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (!usuarioActual || !usuarioActual.uid) {
      console.log('El usuario debe iniciar sesión para dar me gusta');
      return;
    }

    const estadoAnterior = !!tour.esFavorito;
    tour.esFavorito = !estadoAnterior;

    try {
      await this.databaseService.alternarFavorito(
        usuarioActual.uid, 
        tour.id,           
        estadoAnterior     
      );
      console.log(`Favorito modificado con éxito: ${tour.titulo}`);
    } catch (error) {
      console.error('Error al sincronizar el favorito con la base de datos', error);
      tour.esFavorito = estadoAnterior; 
    }
  }

  // 👇 FUNCIÓN PARA EL SCROLL MÁGICO 👇
  handleScroll(event: any) {
    const currentScrollPosition = event.detail.scrollTop;

    // Si pasamos de los 100px y scrolleamos hacia abajo, ocultamos el header
    if (currentScrollPosition > 100 && currentScrollPosition > this.lastScrollPosition) {
      this.isHeaderHidden = true;
    } 
    // Si scrolleamos hacia arriba, lo mostramos
    else if (currentScrollPosition < this.lastScrollPosition) {
      this.isHeaderHidden = false;
    }

    this.lastScrollPosition = currentScrollPosition;
  }
}