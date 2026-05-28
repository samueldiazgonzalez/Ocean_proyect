import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import { firstValueFrom } from 'rxjs';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private notificationService: Notification = inject(Notification);

  public readonly authState$ = authState(this.auth);

  constructor() { }

  /**
   * INICIAR SESIÓN CON EMAIL/PASSWORD
   */
  async login(email: string, contrasena: string) {
    try {
      const credencial = await signInWithEmailAndPassword(this.auth, email, contrasena);
      const user = credencial.user;
      
      // Inicializar notificaciones push después del login exitoso
      await this.notificationService.initPushNotifications(user.uid);
      
      return user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * REGISTRAR USUARIO CON EMAIL/PASSWORD
   */
  async registrarUsuario(email: string, contrasena: string, datosExtra: any) {
    try {
      const credencial = await createUserWithEmailAndPassword(this.auth, email, contrasena);
      const uid = credencial.user.uid;
      
      const nuevoUsuario: Usuario = {
        uid: uid,
        email: email,
        nombre: datosExtra.nombre,
        rol: datosExtra.rol,
        telefono: datosExtra.telefono,
        // Corregido: comillas vacías en lugar de undefined
        nombreAgencia: datosExtra.nombreAgencia || '',
        fechaRegistro: new Date()
      };

      const docRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(docRef, nuevoUsuario);
      
      return nuevoUsuario;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * INICIAR SESIÓN CON GOOGLE
   */
  async loginConGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const resultado = await signInWithPopup(this.auth, provider);
      const user = resultado.user;

      // Guardar en Firestore si es la primera vez
      const docRef = doc(this.firestore, `usuarios/${user.uid}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const nuevoUsuario: Usuario = {
          uid: user.uid,
          email: user.email!,
          nombre: user.displayName || 'Sin nombre',
          rol: 'viajero', // Por defecto, puedes cambiarlo si quieres
          telefono: '',
          // Corregido: comillas vacías en lugar de undefined
          nombreAgencia: '',
          fechaRegistro: new Date()
        };
        await setDoc(docRef, nuevoUsuario);
      }

      // Inicializar notificaciones push después del login exitoso
      await this.notificationService.initPushNotifications(user.uid);

      return user;
    } catch (error) {
      console.error('Error con Google Auth:', error);
      throw error;
    }
  }

 /**
   * CERRAR SESIÓN
   */
  async logout() {
    try {
      const usuarioAuth = await firstValueFrom(this.authState$);
      
      // Eliminar token de notificaciones del servidor antes de desconectar
      if (usuarioAuth) {
        await firstValueFrom(this.notificationService.removeToken(usuarioAuth.uid));
      }
      
      await signOut(this.auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }
  /**
   * OBTENER DATOS DEL USUARIO ACTUAL DESDE FIRESTORE
   */
  async obtenerDatosUsuarioActual() {
    try {
      const usuarioAuth = await firstValueFrom(this.authState$);
      
      if (usuarioAuth) {
        const docRef = doc(this.firestore, `usuarios/${usuarioAuth.uid}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data() as Usuario;
        } else {
          console.log('El usuario existe en Auth, pero no tiene documento en Firestore');
        }
      } else {
        console.log('No hay ninguna sesión activa en este momento');
      }
    } catch (error) {
      console.error('Error leyendo la base de datos:', error);
    }
    
    return null; 
  }
}