import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonList, IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settingsOutline, sunnyOutline, moonOutline, globeOutline } from 'ionicons/icons';
import { SettingsService, SettingsConfig } from '../../core/services/settings';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent,
    IonList, IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon
  ],
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss']
})
export class ConfiguracionPage implements OnInit {
  settings: SettingsConfig = {
    idioma: 'es',
    tema: 'light'
  };

  idiomaOpciones = [
    { label: 'Español', valor: 'es' },
    { label: 'English', valor: 'en' }
  ];

  temaOpciones = [
    { label: 'Claro', valor: 'light' },
    { label: 'Oscuro', valor: 'dark' }
  ];

  constructor(private settingsService: SettingsService) {
    addIcons({ settingsOutline, sunnyOutline, moonOutline, globeOutline });
  }

  ngOnInit() {
    this.settings = this.settingsService.getSettings();
  }

  onIdiomaChange(event: any) {
    const nuevoIdioma = event.detail.value as 'es' | 'en';
    this.settingsService.updateIdioma(nuevoIdioma);
    this.settings = this.settingsService.getSettings();
  }

  onTemaChange(event: any) {
    const nuevoTema = event.detail.value as 'light' | 'dark';
    this.settingsService.updateTema(nuevoTema);
    this.settings = this.settingsService.getSettings();
  }

  toggleTema() {
    this.settingsService.toggleThema();
    this.settings = this.settingsService.getSettings();
  }

  getTexto(key: string): string {
    const textos: { [key: string]: { es: string; en: string } } = {
      titulo: { es: 'Configuración', en: 'Settings' },
      subtitulo: { es: 'Personaliza tu experiencia Ocean', en: 'Customize your Ocean experience' },
      seccion_apariencia: { es: 'Apariencia', en: 'Appearance' },
      seccion_idioma: { es: 'Idioma', en: 'Language' },
      tema: { es: 'Tema', en: 'Theme' },
      tema_desc: { es: 'Claro u Oscuro', en: 'Light or Dark' },
      idioma: { es: 'Idioma', en: 'Language' },
      idioma_desc: { es: 'Selecciona tu idioma preferido', en: 'Select your preferred language' },
      cambiar_tema: { es: 'Cambiar Tema', en: 'Switch Theme' }
    };

    return textos[key]?.[this.settings.idioma] || key;
  }
}
