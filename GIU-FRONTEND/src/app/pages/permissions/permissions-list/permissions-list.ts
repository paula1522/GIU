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
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ResourcesService } from '../../../services/api/resources.service';
import { AuthService } from '../../../services/logic/auth.service';
import { RecursoResponseDTO, RolRecursoResponseDTO } from '../../../models/api/recursos.model';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { Estado, ESTADO_OPTIONS } from '../../../utils/constants/estados.constants';
import { TipoRecurso, TIPO_RECURSO_OPTIONS } from '../../../utils/constants/tipo-recurso.constants';

import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';

@Component({
  selector: 'app-permissions-list',
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
    ConfirmModalComponent,
    HeaderPagesComponent,
    ModalComponent,
  ],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.scss',
})
export class PermissionsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly resourcesService = inject(ResourcesService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Expuestos para el template. */
  readonly Estado = Estado;
  readonly TipoRecurso = TipoRecurso;

  readonly loading = signal(false);
  readonly recursos = signal<RecursoResponseDTO[]>([]);
  readonly apliId = signal(0);

  @ViewChild('modalForm') modalForm!: ModalComponent;
  @ViewChild('modalDetalle') modalDetalle!: ModalComponent;

  //  Configuración de la tabla 
  readonly tableColumnTitle = ['Código', 'Nombre', 'Descripción', 'Tipo', 'Estado', 'Acciones'];
  readonly columnsToDisplay = ['codigo', 'nombre', 'descripcion', 'tipo', 'estado', 'acciones'];

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

  //  Filtros 
  readonly searchForm = this.fb.nonNullable.group({
    search: [''],
  });

  readonly searchSignal = toSignal(this.searchForm.get('search')!.valueChanges, {
    initialValue: '',
  });

  readonly estadoOptions = ESTADO_OPTIONS;

  readonly estadoFiltro = new FormControl('', { nonNullable: true });

  readonly estadoFiltroSignal = toSignal(this.estadoFiltro.valueChanges, {
    initialValue: '',
  });

  readonly filteredRecursos = computed(() => {
    const term = this.searchSignal().toLowerCase().trim();
    const estado = this.estadoFiltroSignal();

    return this.recursos().filter((r) => {
      const coincideTexto =
        !term ||
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        r.tipo.toLowerCase().includes(term);

      const coincideEstado = !estado || r.estado === estado;

      return coincideTexto && coincideEstado;
    });
  });

  //  Header 
  readonly headerButtons = computed<HeaderButton[]>(() => {
    const btns: HeaderButton[] = [];
    if (this.canCreate) {
      btns.push({
        text: 'Crear Permiso',
        icon: 'bi bi-key',
        class: ['btn', 'btn-primary'],
        type: 'button',
        action: 'CREAR',
      });
    }
    return btns;
  });

  onHeaderButtonClick(action: string): void {
    if (action === 'CREAR') this.abrirCrear();
  }

  //  Tabla 
  readonly tableData = computed<ColumnConfig[]>(() =>
    this.filteredRecursos().map((r) => this.buildRow(r))
  );

  private buildRow(r: RecursoResponseDTO): ColumnConfig {
    const buttons: ActionButton[] = [];
    const activo = r.estado === Estado.ACTIVO;

    

    if (this.canEdit) {
      if (activo) {
        buttons.push({
          label: '',
          action: 'EDITAR',
          title: 'Editar permiso',
          icon: 'bi bi-pencil-square',
          class: 'btn-action-edit',
          type: 'button',
        });

        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Inactivar permiso',
          icon: 'bi bi-toggle-off',
          class: 'btn-action-deactivate',
          type: 'button',
        });
      } else {
        buttons.push({
      label: '',
      action: 'VER_DETALLE',
      title: 'Ver detalle del permiso',
      icon: 'bi bi-eye',
      class: 'btn-action-view',
      type: 'button',
    });
        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Activar permiso',
          icon: 'bi bi-toggle-on',
          class: 'btn-action-activate',
          type: 'button',
        });
      }
    }

    return {
      _resource: r,
      codigo: { typeColum: typeColum.string, columValue: r.codigo },
      nombre: { typeColum: typeColum.string, columValue: r.nombre },
      descripcion: { typeColum: typeColum.string, columValue: r.descripcion || '—' },
      tipo: { typeColum: typeColum.string, columValue: r.tipo },
      estado: { typeColum: typeColum.status, columValue: r.estado, satusValue: activo },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const resource: RecursoResponseDTO = event.row._resource;

    switch (event.action) {
      case 'VER_DETALLE': this.abrirDetalle(resource); break;
      case 'EDITAR':      this.abrirEditar(resource); break;
      case 'TOGGLE':      this.toggleEstado(resource); break;
    }
  }

  //  Modal crear/editar 
  readonly editingResource = signal<RecursoResponseDTO | null>(null);
  readonly saving = signal(false);
  resourceForm!: FormGroup;

  private readonly rolesCache = signal<Record<number, RolRecursoResponseDTO[]>>({});
  readonly rolesAsociados = signal<RolRecursoResponseDTO[]>([]);

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
    tipo:   [{ type: 'required', message: 'El tipo es obligatorio.' }],
  };

  readonly tipoOptions = TIPO_RECURSO_OPTIONS;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();

    this.resourceForm = this.fb.group({
      codigo:      ['', [Validators.required, Validators.maxLength(50)]],
      nombre:      ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(200)]],
      tipo:        ['', [Validators.required]],
      estado:      [true],
    });
  }

  get tipoControl(): FormControl {
    return this.resourceForm.get('tipo') as FormControl;
  }

  cargar(): void {
    this.loading.set(true);

    this.resourcesService.listarRecursos(this.apliId()).subscribe({
      next: (res) => {
        this.recursos.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  //  Abrir modales 

  abrirCrear(): void {
    this.editingResource.set(null);
    this.rolesAsociados.set([]);
    this.resourceForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: TipoRecurso.MENU,
      estado: true,
    });
    this.modalForm?.open();
  }

  abrirEditar(resource: RecursoResponseDTO): void {
    this.editingResource.set(resource);

    this.resourceForm.patchValue({
      codigo: resource.codigo,
      nombre: resource.nombre,
      descripcion: resource.descripcion ?? '',
      tipo: resource.tipo,
      estado: resource.estado === Estado.ACTIVO,
    });

    this.cargarRolesAsociados(resource.id);
    this.modalForm?.open();
  }

  cerrarForm(): void {
    this.modalForm?.close();
  }

  private cargarRolesAsociados(recuId: number): void {
    const cached = this.rolesCache()[recuId];

    if (cached) {
      this.rolesAsociados.set(cached);
      return;
    }

    this.resourcesService.obtenerRolesPorRecurso(recuId).subscribe({
      next: (res) => {
        const roles = res.data ?? [];
        this.rolesCache.update((c) => ({ ...c, [recuId]: roles }));
        this.rolesAsociados.set(roles);
      },
      error: () => this.rolesAsociados.set([]),
    });
  }

  //  Guardar 
  guardar(): void {
    if (this.resourceForm.invalid) {
      this.resourceForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.resourceForm.getRawValue();
    const resource = this.editingResource();

    if (resource) {
      this.resourcesService
        .modificarRecurso(this.apliId(), resource.id, {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion || undefined,
          tipo: formValue.tipo,
          estado: formValue.estado ? Estado.ACTIVO : Estado.INACTIVO,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.cerrarForm();
            this.cargar();
          },
          error: () => this.saving.set(false),
        });

      return;
    }

    this.resourcesService
      .crearRecurso(this.apliId(), {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        tipo: formValue.tipo,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.cerrarForm();
          this.cargar();
        },
        error: () => this.saving.set(false),
      });
  }

  //  Modal Detalle 
  readonly detalleResource = signal<RecursoResponseDTO | null>(null);

  abrirDetalle(resource: RecursoResponseDTO): void {
    this.detalleResource.set(resource);
    this.rolesAsociados.set([]);

    this.cargarRolesAsociados(resource.id);
    this.modalDetalle?.open();
  }

  cerrarDetalle(): void {
    this.detalleResource.set(null);
    this.rolesAsociados.set([]);
    this.modalDetalle?.close();
  }

  //  Toggle estado 
  readonly confirmVisible = signal(false);
  readonly confirmResource = signal<RecursoResponseDTO | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  toggleEstado(resource: RecursoResponseDTO): void {
    const activo = resource.estado === Estado.ACTIVO;

    this.confirmResource.set(resource);
    this.confirmTitle.set(activo ? 'Inactivar permiso' : 'Activar permiso');
    this.confirmMsg.set(
      activo
        ? `¿Desea inactivar el permiso "${resource.nombre}" (${resource.codigo})? No podrá asignarse a nuevos roles mientras esté inactivo.`
        : `¿Desea activar el permiso "${resource.nombre}" (${resource.codigo})?`
    );
    this.confirmVisible.set(true);
  }

  ejecutarToggle(): void {
    const resource = this.confirmResource();
    if (!resource) return;

    this.confirmVisible.set(false);

    this.resourcesService
      .modificarRecurso(this.apliId(), resource.id, {
        codigo: resource.codigo,
        nombre: resource.nombre,
        descripcion: resource.descripcion ?? undefined,
        tipo: resource.tipo,
        estado: resource.estado === Estado.ACTIVO ? Estado.INACTIVO : Estado.ACTIVO,
      })
      .subscribe({
        next: () => this.cargar(),
        error: (err) => console.error('ERROR AL CAMBIAR ESTADO:', err),
      });
  }
}