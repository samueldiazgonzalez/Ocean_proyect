import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
  IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonButtons, 
  IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, AlertController, IonSegment, 
  IonSegmentButton, IonThumbnail 
} from '@ionic/angular/standalone';

import { DatabaseService } from '../../core/services/database';
import { Tour } from '../../core/models/tour.model';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, earthOutline, ticketOutline, pauseCircle, trash, eyeOutline } from 'ionicons/icons';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.page.html',
  styleUrls: ['./panel-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, 
    IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonButtons, 
    IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonSegment, IonSegmentButton, IonThumbnail,
    CommonModule, FormsModule, RouterModule
  ]
})
export class PanelAdminPage implements OnInit {
  
  private databaseService = inject(DatabaseService);
  private alertController = inject(AlertController);
  
  toursPendientes: Tour[] = [];
  toursActivos: Tour[] = [];
  totalToursActivos: number = 0;
  segmentoActual: string = 'activos';
  chart: any;

  constructor() {
    addIcons({earthOutline,ticketOutline,eyeOutline,checkmarkCircleOutline,pauseCircle,trash});
  }

  ngOnInit() {
    // Solo cargar tours activos (aprobados) - sin validación pendiente
    this.databaseService.obtenerTours().subscribe(tours => {
      this.toursActivos = tours;
      this.totalToursActivos = tours.length;
      
      setTimeout(() => {
        this.generarGrafica();
      }, 300);
    });
  }

  getCategoryClass(categoria: string | undefined): string {
    if (!categoria) return 'cat-other';
    const categoriaMap: { [key: string]: string } = {
      'tours': 'cat-tour',
      'hoteles': 'cat-hotel',
      'experiencias': 'cat-exp',
      'transporte': 'cat-transport'
    };
    return categoriaMap[categoria.toLowerCase()] || 'cat-other';
  }

  generarGrafica() {
    const conteoCategorias: { [key: string]: number } = {};
    
    this.toursActivos.forEach(tour => {
      const cat = tour.categoria || 'Otros';
      conteoCategorias[cat] = (conteoCategorias[cat] || 0) + 1;
    });

    const etiquetas = Object.keys(conteoCategorias);
    const datos = Object.values(conteoCategorias);

    const ctx = document.getElementById('categoriasChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Cantidad de Servicios',
          data: datos,
          backgroundColor: [
            '#3880ff', 
            '#2dd36f', 
            '#ffc409', 
            '#eb445a', 
            '#2fdf75', 
            '#a232f0'  
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  async suspender(tourId: string | undefined) {
    if (!tourId) return;
    try {
      await this.databaseService.suspenderTour(tourId);
    } catch (error) {
      console.error(error);
    }
  }

  async eliminar(tourId: string | undefined) {
    if (!tourId) return;
    
    const alert = await this.alertController.create({
      header: 'Eliminar Registro',
      message: '¿Estás seguro de que deseas eliminar este tour definitivamente de la base de datos?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive', 
          handler: async () => {
            try {
              await this.databaseService.eliminarTour(tourId);
            } catch (error) {
              console.error(error);
            }
          } 
        }
      ]
    });

    await alert.present();
  }
}