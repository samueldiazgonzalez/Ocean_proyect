import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'vistas/login',
    pathMatch: 'full',
  },
  {
    path: 'vistas/login',
    loadComponent: () => import('./vistas/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./vistas/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./vistas/tabs/tabs.page').then( m => m.TabsPage),
    children: [
      {
        path: 'catalogo',
        loadComponent: () => import('./vistas/catalogo/catalogo.page').then( m => m.CatalogoPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./vistas/perfil/perfil.page').then( m => m.PerfilPage)
      },
      {
        path: 'mis-tours',
        loadComponent: () => import('./vistas/mis-tours/mis-tours.page').then( m => m.MisToursPage),
        canActivate: [authGuard]
      },
      {
        path: 'crear-tour',
        loadComponent: () => import('./vistas/crear-tour/crear-tour.page').then( m => m.CrearTourPage),
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: '/tabs/catalogo',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'detalle-tour/:id',
    loadComponent: () => import('./vistas/detalle-tour/detalle-tour.page').then( m => m.DetalleTourPage)
  },
  {
    path: 'checkout/:id', 
    loadComponent: () => import('./vistas/checkout/checkout.page').then( m => m.CheckoutPage),
    canActivate: [authGuard]
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./vistas/mis-reservas/mis-reservas.page').then( m => m.MisReservasPage),
    canActivate: [authGuard]
  },
  {
    path: 'panel-admin',
    loadComponent: () => import('./vistas/panel-admin/panel-admin.page').then( m => m.PanelAdminPage)
  }
];