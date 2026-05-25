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

import { addIcons } from 'ionicons';
import { cashOutline, arrowForwardOutline, star, water, search, notificationsOutline, personCircleOutline, heartOutline, searchOutline, compassOutline, personOutline, optionsOutline, waterOutline, gridOutline, checkmark, leafOutline, peopleOutline, flameOutline, bookOutline, flowerOutline, ribbonOutline, businessOutline } from 'ionicons/icons';

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
    CommonModule, FormsModule, RouterModule, IonPopover, IonList, IonItem, IonLabel,
  ]
})
export class CatalogoPage implements OnInit {
  private databaseService = inject(DatabaseService);

  //variables para el filtrado

  


async abrirFiltros(event: Event) {
  this.popover.event = event;
  await this.popover.present();
}

@ViewChild('popoverFiltros') popover!: IonPopover;

  tours: any[] = []; 
  toursFiltrados: any[] = []; // 👇 Lista clonada que mostraremos en pantalla
  cargando: boolean = true;
  categoriaSeleccionada: string = 'Todas';
  textoBusqueda: string = '';

  constructor() {
    addIcons({waterOutline,heartOutline,notificationsOutline,personOutline,searchOutline,optionsOutline,gridOutline,checkmark,leafOutline,peopleOutline,flameOutline,bookOutline,flowerOutline,ribbonOutline,businessOutline,compassOutline,star,cashOutline,arrowForwardOutline,water,personCircleOutline,search});
  }

  // Usamos ionViewWillEnter para recargar todo si cambiamos de usuario
  async ionViewWillEnter() {
    this.cargarCatalogo();
  }

  ngOnInit() {
    // OnInit queda vacío, delegamos la carga a ionViewWillEnter
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
                const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
                tour.promedioEstrellas = (suma / resenas.length).toFixed(1);
                tour.totalResenas = resenas.length;
              } else {
                tour.promedioEstrellas = 0;
                tour.totalResenas = 0;
              }
            });
          }
        });

        // Inicialmente mostramos todos los tours
        this.toursFiltrados = [...this.tours];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el catálogo', err);
        this.cargando = false;
      }
    });
  }
  

  // 👇 LA MAGIA DEL FILTRADO 👇
  filtrarTours() {
    let temp = [...this.tours];

    // 1. Aplicamos el filtro de categoría
    if (this.categoriaSeleccionada !== 'Todas') {
      temp = temp.filter(tour => tour.categoria === this.categoriaSeleccionada);
      
    }

    // 2. Aplicamos el filtro de texto (buscando en título y descripción)
    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      const termino = this.textoBusqueda.toLowerCase();
      temp = temp.filter(tour => 
        tour.titulo.toLowerCase().includes(termino) || 
        tour.descripcion.toLowerCase().includes(termino)
      );
    }

    // Actualizamos la vista
    this.toursFiltrados = temp;
  }

  cambiarCategoria(event: any) {
    this.categoriaSeleccionada = event.detail.value;
    this.filtrarTours();
  }

  buscar(event: any) {
    this.textoBusqueda = event.detail.value;
    if (!this.textoBusqueda || this.textoBusqueda.trim() === '') {
    this.toursFiltrados = [...this.tours];
    return;
  }
    this.filtrarTours();
  }

  limpiarBusqueda() {
  this.textoBusqueda = '';
  this.categoriaSeleccionada = 'Todas';
  this.toursFiltrados = [...this.tours];
  }

}