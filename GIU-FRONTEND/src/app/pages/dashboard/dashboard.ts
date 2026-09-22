import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicationMockService } from '../../services/mock/application-mock.service';
import { AuthService } from '../../services/logic/auth.service';
import { ApplicationContextService } from '../../services/logic/application-context.service';
import { Application } from '../../models/domain/giu.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly appService = inject(ApplicationMockService);
  private readonly auth = inject(AuthService);
  private readonly appContext = inject(ApplicationContextService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly aplicaciones = signal<Application[]>([]);
  readonly aplicacionesActivas = signal(0);

  readonly usuarioRed = this.auth.usuarioRed;
  readonly isSuperAdmin = this.auth.isSuperAdmin;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.appService.listar().subscribe({
      next: (res) => {
        const apps = res.data ?? [];
        this.aplicaciones.set(apps);
        this.aplicacionesActivas.set(apps.filter((a) => a.estado === 'ACTIVO').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  seleccionarApp(app: Application): void {
    this.appContext.setCurrentApp(app);
    this.router.navigate(['/aplicaciones', app.id]);
  }

  irAAplicaciones(): void {
    this.router.navigate(['/aplicaciones']);
  }
}
