import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastController = inject(ToastController);

  async mostrarMensaje(mensaje: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom',
      swipeGesture: 'vertical'
    });
    await toast.present();
  }
}