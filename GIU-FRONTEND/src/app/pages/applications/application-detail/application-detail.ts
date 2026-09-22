import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationMockService } from '../../../services/mock/application-mock.service';
import { ApplicationContextService } from '../../../services/logic/application-context.service';
import { AuthService } from '../../../services/logic/auth.service';
import { Application } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss',
})
export class ApplicationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appService = inject(ApplicationMockService);
  private readonly appContext = inject(ApplicationContextService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly app = signal<Application | null>(null);
  readonly apliId = signal(0);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

  // Modal editar
  readonly showEditForm = signal(false);
  readonly saving = signal(false);
  appForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();
    this.appForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(200)]],
      administracion: [false],
    });
  }

  cargar(): void {
    this.loading.set(true);
    this.appService.obtenerPorId(this.apliId()).subscribe({
      next: (res) => {
        const app = res.data;
        this.app.set(app);
        if (app) {
          this.appContext.setCurrentApp(app);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  abrirEditar(): void {
    const app = this.app();
    if (!app) return;
    this.appForm.patchValue({
      codigo: app.codigo,
      nombre: app.nombre,
      descripcion: app.descripcion ?? '',
      administracion: app.administracion === 'PORTAL_CONFIGURACIONES',
    });
    this.showEditForm.set(true);
  }

  cerrarForm(): void { this.showEditForm.set(false); }

  guardar(): void {
    if (this.appForm.invalid) return;
    this.saving.set(true);
    const formValue = this.appForm.getRawValue();
    this.appService.actualizar(this.apliId(), {
      nombre: formValue.nombre,
      codigo: formValue.codigo,
      descripcion: formValue.descripcion || undefined,
      administracion: formValue.administracion,
    }, this.auth.usuarioRed()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEditForm.set(false);
        this.cargar();
      },
      error: () => this.saving.set(false),
    });
  }
}
