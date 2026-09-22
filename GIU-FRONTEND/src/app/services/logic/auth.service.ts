import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionState } from '../../models/domain/giu.models';
import { ALL_PERMISSIONS } from '../../utils/constants/permissions.constants';
import { APP_ROUTES } from '../../utils/constants/routes.constants';

const SESSION_KEY = 'giu_session';

/**
 * Servicio de autenticación y autorización del frontend.
 * Usa sesión mock hasta que el backend implemente login real.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly session = signal<SessionState | null>(this.restore());
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isSuperAdmin = computed(() => this.session()?.superAdmin ?? false);
  readonly usuarioRed = computed(() => this.session()?.usuarioRed ?? '');
  readonly nombre = computed(() => this.session()?.nombre ?? '');
  readonly permisos = computed(() => this.session()?.permisos ?? []);

  /**
   * Login mock: crea sesión con todos los permisos.
   */
  loginMock(username: string): void {
    const state: SessionState = {
      usuarioRed: username,
      nombre: 'Super Administrador',
      correo: 'admin@claro.com.co',
      superAdmin: true,
      permisos: [...ALL_PERMISSIONS],
    };
    this.session.set(state);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }

  /**
   * Logout: limpia sesión y redirige al login.
   */
  logout(): void {
    this.session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    this.router.navigate([APP_ROUTES.LOGIN]);
  }

  /**
   * Verifica si el usuario tiene un permiso.
   */
  hasPermission(codigo: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.permisos().includes(codigo);
  }

  /**
   * Verifica si tiene alguno de los permisos.
   */
  hasAnyPermission(codigos: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    return codigos.some((c) => this.hasPermission(c));
  }

  private restore(): SessionState | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as SessionState) : null;
    } catch {
      return null;
    }
  }
}
