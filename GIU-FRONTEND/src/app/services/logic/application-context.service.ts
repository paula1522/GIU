import { Injectable, signal, computed } from '@angular/core';
import { Application } from '../../models/domain/giu.models';

const APP_KEY = 'giu_current_app';

/**
 * Contexto de aplicación actual.
 * Mantiene la aplicación que el usuario está administrando
 * para que el sidebar pueda mostrar opciones contextuales.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationContextService {
  readonly currentApp = signal<Application | null>(this.restore());
  readonly hasCurrentApp = computed(() => this.currentApp() !== null);
  readonly currentAppId = computed(() => this.currentApp()?.id ?? null);
  readonly currentAppName = computed(() => this.currentApp()?.nombre ?? '');

  setCurrentApp(app: Application): void {
    this.currentApp.set(app);
    sessionStorage.setItem(APP_KEY, JSON.stringify(app));
  }

  clearCurrentApp(): void {
    this.currentApp.set(null);
    sessionStorage.removeItem(APP_KEY);
  }

  private restore(): Application | null {
    try {
      const raw = sessionStorage.getItem(APP_KEY);
      return raw ? (JSON.parse(raw) as Application) : null;
    } catch {
      return null;
    }
  }
}
