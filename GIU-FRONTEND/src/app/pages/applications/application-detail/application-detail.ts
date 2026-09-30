import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { AplicacionesService } from '../../../services/api/aplicaciones.service';
import { ApplicationContextService } from '../../../services/logic/application-context.service';
import { AuthService } from '../../../services/logic/auth.service';
import { AplicacionResponseDTO } from '../../../models/api/aplicaciones.model';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { Estado } from '../../../utils/constants/estados.constants';
import { Administracion } from '../../../utils/constants/administracion.constants';

import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    ModalComponent,
  ],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss',
})
export class ApplicationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appService = inject(AplicacionesService);
  private readonly appContext = inject(ApplicationContextService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Expuestos para el template. */
  readonly Estado = Estado;
  readonly Administracion = Administracion;

  @ViewChild('modalForm') modalForm!: ModalComponent;

  readonly loading = signal(false);
  readonly app = signal<AplicacionResponseDTO | null>(null);
  readonly apliId = signal(0);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

  readonly saving = signal(false);
  appForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);

    this.appForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(200)]],
      administracion: [false],
    });

    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);

    this.appService.listar().subscribe({
      next: (res) => {
        const dto = (res.data ?? []).find((a) => a.id === this.apliId()) ?? null;
        this.app.set(dto);

        if (dto) {
          this.appContext.setCurrentApp(dto);
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
      // true = PROPIA / false = PORTAL_CONFIGURACIONES
      administracion: app.administracion === Administracion.PROPIA,
    });

    this.modalForm?.open();
  }

  cerrarForm(): void {
    this.modalForm?.close();
  }

  guardar(): void {
    if (this.appForm.invalid) {
      this.appForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.appForm.getRawValue();

    this.appService
      .modificar(
        this.apliId(),
        {
          nombre: formValue.nombre,
          codigo: formValue.codigo,
          descripcion: formValue.descripcion || undefined,
          administracion: formValue.administracion,
        },
        this.auth.usuarioRed()
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.cerrarForm();
          this.cargar();
        },
        error: () => this.saving.set(false),
      });
  }
}