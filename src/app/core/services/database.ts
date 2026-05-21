import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  setDoc, 
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore'; 

import { Observable } from 'rxjs';
import { Tour } from '../models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private firestore: Firestore = inject(Firestore);

  constructor() { }

  /**
   * 1. LEER TODOS LOS TOURS (SOLO APROBADOS)
   */
  obtenerTours(): Observable<Tour[]> {
    const toursRef = collection(this.firestore, 'tours');
    const q = query(toursRef, where('estado', '==', 'aprobado'));
    return collectionData(q, { idField: 'id' }) as Observable<Tour[]>;
  }

  /**
   * OBTENER TOURS PENDIENTES
   */
  obtenerToursPendientes(): Observable<Tour[]> {
    const toursRef = collection(this.firestore, 'tours');
    const q = query(toursRef, where('estado', '==', 'pendiente'));
    return collectionData(q, { idField: 'id' }) as Observable<Tour[]>;
  }

  /**
   * APROBAR TOUR
   */
  async aprobarTour(tourId: string) {
    try {
      const tourRef = doc(this.firestore, `tours/${tourId}`);
      await updateDoc(tourRef, { estado: 'aprobado' });
      console.log('¡Tour aprobado y visible en el catálogo!');
    } catch (error) {
      console.error('Error aprobando el tour:', error);
      throw error;
    }
  }

  /**
   * TRAER TODOS LOS TOURS SIN FILTRO
   */
  obtenerTodosLosTours(): Observable<Tour[]> {
    const toursRef = collection(this.firestore, 'tours');
    return collectionData(toursRef, { idField: 'id' }) as Observable<Tour[]>;
  }

  /**
   * ELIMINAR TOUR DEFINITIVAMENTE
   */
  async eliminarTour(tourId: string) {
    const tourRef = doc(this.firestore, `tours/${tourId}`);
    return await deleteDoc(tourRef);
  }

  /**
   * SUSPENDER TOUR
   */
  async suspenderTour(tourId: string) {
    const tourRef = doc(this.firestore, `tours/${tourId}`);
    return await updateDoc(tourRef, { estado: 'pendiente' });
  }

  /**
   * 2. OBTENER UN TOUR POR ID
   */
  async obtenerTourPorId(id: string) {
    try {
      const docRef = doc(this.firestore, `tours/${id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Tour;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener el tour:', error);
      throw error;
    }
  }

  /**
   * 3. CREAR TOUR
   */
  async agregarTour(nuevoTour: Tour) {
    try {
      const toursRef = collection(this.firestore, 'tours');
      const docRef = await addDoc(toursRef, nuevoTour);
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar el tour:', error);
      throw error;
    }
  }

  /**
   * 4. TOURS POR PROVEEDOR
   */
  obtenerToursPorProveedor(proveedorId: string): Observable<Tour[]> {
    const toursRef = collection(this.firestore, 'tours');
    const q = query(toursRef, where('proveedorId', '==', proveedorId));
    return collectionData(q, { idField: 'id' }) as Observable<Tour[]>;
  }

  /**
   * 5. CREAR RESERVA
   */
  async crearReserva(reservaData: any) {
    try {
      const reservasRef = collection(this.firestore, 'reservas');
      const docRef = await addDoc(reservasRef, reservaData);
      console.log('Reserva guardada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar la reserva en Firebase:', error);
      throw error;
    }
  }

  /**
   * 6. RESERVAS POR TURISTA
   */
  obtenerReservasPorTurista(turistaId: string): Observable<any[]> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('turistaId', '==', turistaId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  /**
   * 7. GUARDAR USUARIO
   */
  async guardarUsuario(uid: string, datosUsuario: any) {
    try {
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(usuarioRef, datosUsuario);
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      throw error;
    }
  }

  /**
   * 8. ACTUALIZAR RESERVA
   */
  async actualizarReserva(reservaId: string, datosNuevos: any) {
    try {
      const reservaRef = doc(this.firestore, `reservas/${reservaId}`);
      await updateDoc(reservaRef, datosNuevos);
      console.log('Reserva actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando la reserva:', error);
      throw error;
    }
  }

  /**
   * 9. OBTENER RESERVA POR ID
   */
  async obtenerReservaPorId(reservaId: string) {
    const docRef = doc(this.firestore, `reservas/${reservaId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  }

  /**
   * 10. ACTUALIZAR USUARIO
   */
  async actualizarUsuario(uid: string, datosNuevos: any) {
    try {
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(usuarioRef, datosNuevos);
      console.log('Perfil actualizado');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * 11. SISTEMA DE CALIFICACIONES Y RESEÑAS (⭐)
   * ==========================================
   */

  async agregarResena(tourId: string, usuarioId: string, nombreUsuario: string, calificacion: number, comentario: string) {
    try {
      const resenasRef = collection(this.firestore, 'resenas');
      const nuevaResena = {
        tourId: tourId,
        usuarioId: usuarioId,
        nombreUsuario: nombreUsuario,
        calificacion: calificacion,
        comentario: comentario,
        fecha: new Date().toISOString()
      };
      await addDoc(resenasRef, nuevaResena);
      console.log('Reseña guardada con éxito');
    } catch (error) {
      console.error('Error al guardar la reseña:', error);
      throw error;
    }
  }

  obtenerResenasPorTour(tourId: string): Observable<any[]> {
    const resenasRef = collection(this.firestore, 'resenas');
    const q = query(resenasRef, where('tourId', '==', tourId));
    return collectionData(q, { idField: 'id' });
  }



  /**
   * ==========================================
   * 12. SISTEMA DE FAVORITOS (❤️)
   * ==========================================
   */

  async alternarFavorito(turistaId: string, tourId: string, yaEsFavorito: boolean) {
    // Usamos un ID compuesto para encontrarlo rapidísimo
    const docRef = doc(this.firestore, `favoritos/${turistaId}_${tourId}`);
    try {
      if (yaEsFavorito) {
        await deleteDoc(docRef); // Si ya era favorito, se lo quitamos (Dislike)
      } else {
        // Si no era, lo guardamos (Like)
        await setDoc(docRef, { 
          turistaId: turistaId, 
          tourId: tourId, 
          fecha: new Date().toISOString() 
        });
      }
    } catch (error) {
      console.error('Error al modificar favorito:', error);
      throw error;
    }
  }

  obtenerFavoritosPorTurista(turistaId: string): Observable<any[]> {
    const favRef = collection(this.firestore, 'favoritos');
    const q = query(favRef, where('turistaId', '==', turistaId));
    return collectionData(q, { idField: 'id' });
  }
}