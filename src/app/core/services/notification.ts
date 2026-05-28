import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private readonly API_URL = environment.notificationServiceUrl;
  private readonly API_KEY = environment.notificationServiceKey;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.API_KEY
  });

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Llama este método al hacer login el usuario
   * Pide permisos, obtiene el token FCM y lo registra en el microservicio
   */
  async initPushNotifications(userId: string): Promise<void> {
    try {
      // 1. Solicitar permisos al sistema operativo
      const permission = await PushNotifications.requestPermissions();

      if (permission.receive !== 'granted') {
        console.warn('⚠️ Permisos de notificación denegados');
        return;
      }

      // 2. Registrar en Firebase para obtener el token FCM
      await PushNotifications.register();

      // 3. Escuchar el token y enviarlo al microservicio
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('✅ FCM Token recibido:', token.value);
        this.registerToken(userId, token.value).subscribe({
          next: (res) => console.log('✅ Token registrado en el servidor:', res),
          error: (err) => console.error('❌ Error registrando token:', err)
        });
      });

      // 4. Manejar notificaciones recibidas en FOREGROUND
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('🔔 Notificación en foreground:', notification);
          // Aquí puedes mostrar un toast o modal en tu app
        }
      );

      // 5. Manejar tap en la notificación (cuando app está en background)
      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action) => {
          const data = action.notification.data;
          console.log('👆 Usuario tocó notificación:', data);

          // Navegar según el tipo de notificación
          if (data?.type === 'BOOKING_CONFIRMED' || data?.type === 'BOOKING_REMINDER') {
            this.router.navigate(['/mis-reservas']);
          }
        }
      );

    } catch (error) {
      console.error('❌ Error inicializando push notifications:', error);
    }
  }

  /**
   * Registra el token FCM en el microservicio
   */
  registerToken(userId: string, fcmToken: string): Observable<any> {
    const platform = this.getPlatform();
    return this.http.post(
      `${this.API_URL}/api/devices/register`,
      { userId, fcmToken, platform },
      { headers: this.headers }
    );
  }

  /**
   * Elimina el token al cerrar sesión
   */
  removeToken(userId: string): Observable<any> {
    return this.http.delete(
      `${this.API_URL}/api/devices/${userId}`,
      { headers: this.headers }
    );
  }

  /**
   * Detecta la plataforma del dispositivo
   */
  private getPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    return 'android';
  }
}
