import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    // Configuración de Firebase corregida (sin projectNumber ni version)
    provideFirebaseApp(() => initializeApp({ 
      projectId: "oceanapp-df9f2", 
      appId: "1:331988476007:web:7ec624069592d44047f4c2", 
      storageBucket: "oceanapp-df9f2.firebasestorage.app", 
      apiKey: "AIzaSyAgJ6eyrSE-8vzu84BGqnYZdTciK5QTbcw", 
      authDomain: "oceanapp-df9f2.firebaseapp.com", 
      messagingSenderId: "331988476007" 
    })), 
    
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
  ],
}).catch(err => console.error(err));