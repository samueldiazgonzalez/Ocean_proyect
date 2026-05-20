import { Component, OnInit, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, personOutline, heartOutline, gridOutline, briefcaseOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

// Importamos el servicio para saber el rol
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage implements OnInit {

  private authService = inject(AuthService);
  rol: string = '';

  constructor() {
    addIcons({ mapOutline, personOutline, heartOutline, gridOutline, briefcaseOutline });
  }

  async ngOnInit() {
    // Averiguamos el rol del usuario conectado
    const usuario = await this.authService.obtenerDatosUsuarioActual();
    if (usuario) {
      this.rol = usuario.rol;
    }
  }
}
