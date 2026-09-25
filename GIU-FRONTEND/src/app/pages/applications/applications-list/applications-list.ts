import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationMockService } from '../../../services/mock/application-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { ApplicationContextService } from '../../../services/logic/application-context.service';
import { Application, CreateApplicationRequest, UpdateApplicationRequest } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { HeaderPagesComponent, HeaderButton } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, SelectComponent, ButtonComponent, HeaderPagesComponent, ConfirmModalComponent],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss',
})
export class ApplicationsList implements OnInit {
  private readonly appService = inject(ApplicationMockService);
  private readonly auth = inject(AuthService);
  private readonly appContext = inject(ApplicationContextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly aplicaciones = signal<Application[]>([]);
  readonly filteredApps = signal<Application[]>([]);

  // Formulario reactivo de filtros
  filtrosForm!: FormGroup;

  // Opciones para el select de estado
  readonly estadoOptions = [
    { id: '', nameSelect: 'Todos' },
    { id: 'ACTIVO', nameSelect: 'Activo' },
    { id: 'INACTIVO', nameSelect: 'Inactivo' },
  ];

  get estadoFiltroControl(): FormControl { return this.filtrosForm.get('estado') as FormControl; }

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Nombre', 'Código', 'Descripción', 'Estado', 'Administración', 'Acciones'];
  readonly columnsToDisplay = ['nombre', 'codigo', 'descripcion', 'estado', 'administracion', 'acciones'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredApps().map((a) => this.buildRow(a));
  });

  private buildRow(a: Application): ColumnConfig {
    const buttons: ActionButton[] = [
      { label: 'Administrar', action: 'ADMINISTRAR', title: 'Administrar aplicación', icon: 'bi bi-gear', styles: 'btn-table-admin', type: 'button' },
    ];
    if (this.canEdit) {
      buttons.push({ label: 'Editar', action: 'EDITAR', title: 'Editar aplicación', icon: 'bi bi-pencil-square', styles: 'btn-table-edit', type: 'button' });
    }
    if (this.canEdit) {
      buttons.push({
        label: a.estado === 'ACTIVO' ? 'Inactivar' : 'Activar',
        action: 'TOGGLE',
        title: a.estado === 'ACTIVO' ? 'Inactivar aplicación' : 'Activar aplicación',
        icon: a.estado === 'ACTIVO' ? 'bi bi-toggle-on' : 'bi bi-toggle-off',
        styles: a.estado === 'ACTIVO' ? 'btn-table-danger' : 'btn-table-success',
        type: 'button',
      });
    }

    return {
      _app: a,
      nombre: { typeColum: typeColum.string, columValue: a.nombre },
      codigo: { typeColum: typeColum.string, columValue: a.codigo },
      descripcion: { typeColum: typeColum.string, columValue: a.descripcion || '—' },
      estado: { typeColum: typeColum.status, columValue: a.estado, satusValue: a.estado === 'ACTIVO' },
      administracion: { typeColum: typeColum.string, columValue: a.administracion },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const app: Application = event.row._app;
    if (event.action === 'ADMINISTRAR') {
      this.seleccionar(app);
    } else if (event.action === 'EDITAR') {
      this.abrirEditar(app);
    } else if (event.action === 'TOGGLE') {
      this.toggleEstado(app);
    }
  }

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.APLICACIONES_CREAR);

  /** Botones dinámicos para el header-pages. */
  readonly headerButtons = computed<HeaderButton[]>(() => {
    const btns: HeaderButton[] = [];
    if (this.canCreate) {
      btns.push({
        text: 'Nueva aplicación',
        icon: 'bi bi-app-indicator',
        class: ['btn', 'btn-primary'],
        type: 'button',
        action: 'NUEVA',
      });
    }
    return btns;
  });

  /** Maneja los eventos de botones del header-pages. */
  onHeaderButtonClick(action: string): void {
    if (action === 'NUEVA') {
      this.abrirCrear();
    }
  }
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

  // Modal de formulario
  readonly showForm = signal(false);
  readonly editingApp = signal<Application | null>(null);
  appForm!: FormGroup;
  readonly saving = signal(false);

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
  };

  // Modal de confirmación
  readonly confirmVisible = signal(false);
  readonly confirmApp = signal<Application | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      searchTerm: [''],
      estado: [''],
    });
    this.filtrosForm.valueChanges.subscribe(() => this.filtrar());
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
    this.appService.listar().subscribe({
      next: (res) => {
        this.aplicaciones.set(res.data ?? []);
        this.filtrar();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const v = this.filtrosForm?.getRawValue() ?? {};
    const term = (v.searchTerm ?? '').toLowerCase();
    const estado = v.estado ?? '';
    this.filteredApps.set(
      this.aplicaciones().filter(
        (a) =>
          (!term || a.nombre.toLowerCase().includes(term) || a.codigo.toLowerCase().includes(term)) &&
          (!estado || a.estado === estado)
      )
    );
  }

  /** Limpia todos los filtros. */
  limpiarFiltros(): void {
    this.filtrosForm?.reset({ searchTerm: '', estado: '' });
    this.filtrar();
  }

  seleccionar(app: Application): void {
    this.appContext.setCurrentApp(app);
    this.router.navigate(['/aplicaciones', app.id]);
  }

  toggleEstado(app: Application): void {
    this.confirmApp.set(app);
    this.confirmTitle.set(app.estado === 'ACTIVO' ? 'Inactivar aplicación' : 'Activar aplicación');
    this.confirmMsg.set(
      app.estado === 'ACTIVO'
        ? `¿Desea inactivar la aplicación "${app.nombre}"? Las aplicaciones inactivas no permitirán autenticación ni administración.`
        : `¿Desea activar la aplicación "${app.nombre}"?`
    );
    this.confirmVisible.set(true);
  }

  ejecutarToggle(): void {
    const app = this.confirmApp();
    if (!app) return;
    this.confirmVisible.set(false);
    this.appService
      .actualizar(app.id, { estado: app.estado !== 'ACTIVO' }, this.auth.usuarioRed())
      .subscribe(() => this.cargar());
  }

  abrirCrear(): void {
    this.editingApp.set(null);
    this.appForm?.reset({ codigo: '', nombre: '', descripcion: '', administracion: false });
    this.showForm.set(true);
  }

  abrirEditar(app: Application): void {
    this.editingApp.set(app);
    this.appForm?.patchValue({
      codigo: app.codigo,
      nombre: app.nombre,
      descripcion: app.descripcion ?? '',
      administracion: app.administracion === 'PORTAL_CONFIGURACIONES',
    });
    this.showForm.set(true);
  }

  cerrarForm(): void { this.showForm.set(false); }

  guardar(): void {
    if (this.appForm.invalid) return;
    this.saving.set(true);
    const formValue = this.appForm.getRawValue();
    const app = this.editingApp();
    if (app) {
      this.appService
        .actualizar(app.id, {
          nombre: formValue.nombre,
          codigo: formValue.codigo,
          descripcion: formValue.descripcion || undefined,
          administracion: formValue.administracion,
        }, this.auth.usuarioRed())
        .subscribe({
          next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); },
          error: () => this.saving.set(false),
        });
    } else {
      this.appService
        .crear({
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion || undefined,
          administracion: formValue.administracion,
        }, this.auth.usuarioRed())
        .subscribe({
          next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); },
          error: () => this.saving.set(false),
        });
    }
  }
}
