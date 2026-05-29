import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SettingsConfig {
  idioma: 'es' | 'en';
  tema: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SettingsConfig>(
    this.loadSettings()
  );
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.applyTheme(this.settingsSubject.value.tema);
  }

  private loadSettings(): SettingsConfig {
    const saved = localStorage.getItem('ocean_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      idioma: 'es',
      tema: 'light'
    };
  }

  getSettings(): SettingsConfig {
    return this.settingsSubject.value;
  }

  updateTema(tema: 'light' | 'dark'): void {
    const current = this.settingsSubject.value;
    const updated = { ...current, tema };
    this.settingsSubject.next(updated);
    localStorage.setItem('ocean_settings', JSON.stringify(updated));
    this.applyTheme(tema);
  }

  updateIdioma(idioma: 'es' | 'en'): void {
    const current = this.settingsSubject.value;
    const updated = { ...current, idioma };
    this.settingsSubject.next(updated);
    localStorage.setItem('ocean_settings', JSON.stringify(updated));
  }

  private applyTheme(tema: 'light' | 'dark'): void {
    const html = document.documentElement;
    if (tema === 'dark') {
      html.style.setProperty('color-scheme', 'dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      html.style.setProperty('color-scheme', 'light');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  toggleThema(): void {
    const current = this.settingsSubject.value;
    const newTema = current.tema === 'light' ? 'dark' : 'light';
    this.updateTema(newTema);
  }

  toggleIdioma(): void {
    const current = this.settingsSubject.value;
    const newIdioma = current.idioma === 'es' ? 'en' : 'es';
    this.updateIdioma(newIdioma);
  }
}
