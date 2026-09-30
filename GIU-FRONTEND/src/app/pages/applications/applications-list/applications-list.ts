import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AplicacionesService } from '../../../services/api/aplicaciones.service';
import { AuthService } from '../../../services/logic/auth.service';
import { ApplicationContextService } from '../../../services/logic/application-context.service';
import { AplicacionResponseDTO } from '../../../models/api/aplicaciones.model';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { Estado } from '../../../utils/constants/estados.constants';
import { Administracion } from '../../../utils/constants/administracion.constants';

import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import {
  ColumnConfig,
  ActionButton,
  typeColum,
} from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import {
  HeaderPagesComponent,
  HeaderButton,
} from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    CheckboxComponent,
    HeaderPagesComponent,
    ConfirmModalComponent,
    ModalComponent,
  ],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss',
})
export class ApplicationsList implements OnInit {
  private readonly appService = inject(AplicacionesService);
  private readonly auth = inject(AuthService);
  private readonly appContext = inject(ApplicationContextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** Expuestos para el template. */
  readonly Estado = Estado;
  readonly Administracion = Administracion;

  @ViewChild('modalForm') modalForm!: ModalComponent;
  @ViewChild('modalDetalle') modalDetalle!: ModalComponent;

  readonly loading = signal(false);
  readonly aplicaciones = signal<AplicacionResponseDTO[]>([]);
  readonly filteredApps = signal<AplicacionResponseDTO[]>([]);

  // Filtros
  filtrosForm!: FormGroup;

  readonly estadoOptions = [
    { id: '', nameSelect: 'Todos' },
    { id: Estado.ACTIVO, nameSelect: 'Activo' },
    { id: Estado.INACTIVO, nameSelect: 'Inactivo' },
  ];

  get estadoFiltroControl(): FormControl {
    return this.filtrosForm.get('estado') as FormControl;
  }

  // Tabla
  readonly tableColumnTitle = ['Nombre', 'Código', 'Descripción', 'Estado', 'Administración', 'Acciones'];
  readonly columnsToDisplay = ['nombre', 'codigo', 'descripcion', 'estado', 'administracion', 'acciones'];

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.APLICACIONES_CREAR);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

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

  onHeaderButtonClick(action: string): void {
    if (action === 'NUEVA') this.abrirCrear();
  }

  readonly tableData = computed<ColumnConfig[]>(() =>
    this.filteredApps().map((a) => this.buildRow(a))
  );

  private buildRow(a: AplicacionResponseDTO): ColumnConfig {
    const buttons: ActionButton[] = [];
    const activo = a.estado === Estado.ACTIVO;

    buttons.push({
      label: '',
      action: 'ADMINISTRAR',
      title: 'Administrar aplicación',
      icon: 'bi bi-gear',
      class: 'btn-action-users',
      type: 'button',
    });

    if (activo) {
      if (this.canEdit) {
        buttons.push({
          label: '',
          action: 'EDITAR',
          title: 'Editar aplicación',
          icon: 'bi bi-pencil-square',
          class: 'btn-action-edit',
          type: 'button',
        });

        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Inactivar aplicación',
          icon: 'bi bi-toggle-off',
          class: 'btn-action-deactivate',
          type: 'button',
        });
      }
    } else {
      buttons.push({
        label: '',
        action: 'VER_DETALLE',
        title: 'Ver detalle de la aplicación',
        icon: 'bi bi-eye',
        class: 'btn-action-view',
        type: 'button',
      });

      if (this.canEdit) {
        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Activar aplicación',
          icon: 'bi bi-toggle-on',
          class: 'btn-action-activate',
          type: 'button',
        });
      }
    }

    return {
      _app: a,
      nombre: { typeColum: typeColum.string, columValue: a.nombre },
      codigo: { typeColum: typeColum.string, columValue: a.codigo },
      descripcion: { typeColum: typeColum.string, columValue: a.descripcion || '—' },
      estado: { typeColum: typeColum.status, columValue: a.estado, satusValue: activo },
      administracion: { typeColum: typeColum.string, columValue: a.administracion },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const app: AplicacionResponseDTO = event.row._app;

    switch (event.action) {
      case 'VER_DETALLE': this.abrirDetalle(app); break;
      case 'ADMINISTRAR': this.seleccionar(app); break;
      case 'EDITAR':      this.abrirEditar(app); break;
      case 'TOGGLE':      this.toggleEstado(app); break;
    }
  }

  // Modal Editar/Crear
  readonly editingApp = signal<AplicacionResponseDTO | null>(null);
  readonly saving = signal(false);
  appForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
  };

  // Modal Detalle
  readonly detalleApp = signal<AplicacionResponseDTO | null>(null);

  // Confirm
  readonly confirmVisible = signal(false);
  readonly confirmApp = signal<AplicacionResponseDTO | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      searchTerm: [''],
      estado: [''],
    });
    this.filtrosForm.valueChanges.subscribe(() => this.filtrar());

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
          (!term ||
            a.nombre.toLowerCase().includes(term) ||
            a.codigo.toLowerCase().includes(term)) &&
          (!estado || a.estado === estado)
      )
    );
  }

  limpiarFiltros(): void {
    this.filtrosForm?.reset({ searchTerm: '', estado: '' });
    this.filtrar();
  }

  seleccionar(app: AplicacionResponseDTO): void {
    this.appContext.setCurrentApp(app);
    this.router.navigate(['/aplicaciones', app.id]);
  }

  //  Modal Detalle 
  abrirDetalle(app: AplicacionResponseDTO): void {
    this.detalleApp.set(app);
    this.modalDetalle?.open();
  }

  cerrarDetalle(): void {
    this.detalleApp.set(null);
    this.modalDetalle?.close();
  }

  //  Modal Editar/Crear 
  abrirCrear(): void {
    this.editingApp.set(null);
    this.appForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      administracion: false,
    });
    this.modalForm?.open();
  }

  abrirEditar(app: AplicacionResponseDTO): void {
    this.editingApp.set(app);
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
    const app = this.editingApp();

    if (app) {
      this.appService
        .modificar(
          app.id,
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
    } else {
      this.appService
        .crear(
          {
            codigo: formValue.codigo,
            nombre: formValue.nombre,
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

  //  Toggle estado 
  toggleEstado(app: AplicacionResponseDTO): void {
    const activo = app.estado === Estado.ACTIVO;

    this.confirmApp.set(app);
    this.confirmTitle.set(activo ? 'Inactivar aplicación' : 'Activar aplicación');
    this.confirmMsg.set(
      activo
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
      .modificar(app.id, { estado: app.estado !== Estado.ACTIVO }, this.auth.usuarioRed())
      .subscribe(() => this.cargar());
  }
}