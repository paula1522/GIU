import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/logic/auth.service';
import { ApplicationContextService } from '../../../services/logic/application-context.service';
import { APP_ROUTES } from '../../../utils/constants/routes.constants';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  readonly appContext = inject(ApplicationContextService);
  private readonly router = inject(Router);

  readonly sidebarVisible = signal(true);
  readonly sidebarCollapsed = signal(false);
  readonly userMenuOpen = signal(false);

  readonly usuarioRed = this.auth.usuarioRed;
  readonly nombre = this.auth.nombre;
  readonly isSuperAdmin = this.auth.isSuperAdmin;

  readonly hasCurrentApp = this.appContext.hasCurrentApp;
  readonly currentApp = this.appContext.currentApp;
  readonly currentAppId = this.appContext.currentAppId;
  readonly currentAppName = this.appContext.currentAppName;

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleSidebarMobile(): void {
    this.sidebarVisible.update((v) => !v);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  /** Cierra el sidebar solo en móvil (<= 768px). En desktop no hace nada. */
  onNavClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarVisible.set(false);
    }
  }

  /** Limpia el contexto de aplicación y cierra el sidebar en móvil. */
  onNavClickClearApp(): void {
    this.appContext.clearCurrentApp();
    this.onNavClick();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.userMenuOpen() && !target.closest('.user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  logout(): void {
    this.appContext.clearCurrentApp();
    this.auth.logout();
  }

  goToDashboard(): void {
    this.appContext.clearCurrentApp();
    this.router.navigate([APP_ROUTES.FULL.DASHBOARD]);
  }
}
