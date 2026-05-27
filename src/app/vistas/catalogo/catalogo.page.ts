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

    // 1. Filtro de Pestañas (Aventuras vs Hoteles)
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

  // 👇 ESTA ES LA ÚNICA FUNCIÓN QUE CAMBIÓ 👇
  // FUNCION REAL DE FAVORITOS (Conectada a Firebase)
// FUNCION REAL DE FAVORITOS (Conectada al DatabaseService)
  async toggleFavorito(tour: any) {
    // 1. Obtenemos el turista que tiene la sesión iniciada
    const usuarioActual = await this.authService.obtenerDatosUsuarioActual();

    if (!usuarioActual || !usuarioActual.uid) {
      console.log('El usuario debe iniciar sesión para dar me gusta');
      return;
    }

    // 2. Guardamos el estado anterior por si falla la base de datos
    const estadoAnterior = !!tour.esFavorito;

    // 3. Hacemos el cambio visual de inmediato (Optimistic UI)
    tour.esFavorito = !estadoAnterior;

    // 4. Conectamos con tu función única alternarFavorito de Firebase
    try {
      await this.databaseService.alternarFavorito(
        usuarioActual.uid, // turistaId
        tour.id,           // tourId
        estadoAnterior     // ¿yaEsFavorito? Le pasamos el estado que tenía antes del click
      );
      console.log(`Favorito modificado con éxito: ${tour.titulo}`);
    } catch (error) {
      console.error('Error al sincronizar el favorito con la base de datos', error);
      // Si el internet falla, revertimos el color del corazón al estado original
      tour.esFavorito = estadoAnterior; 
    }
  }
}