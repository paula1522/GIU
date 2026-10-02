import { Component, inject, signal, computed, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../../services/api/users.service';
import { AuthService } from '../../../services/logic/auth.service';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { Estado, ESTADO_OPTIONS } from '../../../utils/constants/estados.constants';
import { EstadoUsuario } from '../../../utils/constants/estados.constants';

import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import {
  ColumnConfig,
  ActionButton,
  typeColum,
} from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';
import {
  HeaderButton,
  HeaderPagesComponent,
} from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';

import { minSelectedValidator } from '../validators/min-selected.validator';
import { RoleService } from '../../../services/api/roles.service';
import {
  CrearRolRequest,
  ModificarRolRequest,
  RecursosRolResponse,
  RolResponseDTO,
} from '../../../models/api/roles.model';
import {
  AsignarRolRequest,
  GestionarEstadoUsuarioRequest,
  UsuarioAsignadoRol,
  UsuarioResponseDTO,
} from '../../../models/api/users.model';
import { RecursoResponseDTO } from '../../../models/api/recursos.model';
import { ResourcesService } from '../../../services/api/resources.service';

import { forkJoin, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    ConfirmModalComponent,
    ModalComponent,
    HeaderPagesComponent,
    SelectComponent,
  ],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss',
})
export class RolesList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleService);
  private readonly recursosService = inject(ResourcesService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  /** Constante local para el valor de "Activar" según el backend. */
  private readonly OPERACION_ACTIVAR_USUARIO = 0;

  /** Expuestos para el template. */
  readonly Estado = Estado;
  readonly EstadoUsuario = EstadoUsuario;

  //  Refs de modales 

  @ViewChild('modalForm') modalForm!: ModalComponent;
  @ViewChild('modalUsuarios') modalUsuarios!: ModalComponent;
  @ViewChild('modalDetalle') modalDetalle!: ModalComponent;

  //  Estado general 

  readonly loading = signal(false);
  readonly roles = signal<RolResponseDTO[]>([]);
  readonly apliId = signal(0);

  readonly recursos = signal<RecursoResponseDTO[]>([]);

  private readonly roleDetalleCache = signal<Record<number, number[]>>({});

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

  readonly filteredRoles = computed(() => {
    const term = this.searchSignal().toLowerCase().trim();
    const estado = this.estadoFiltroSignal();

    return this.roles().filter((r) => {
      const coincideTexto =
        !term ||
        r.nombre.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term);

      const coincideEstado = !estado || r.estado === estado;

      return coincideTexto && coincideEstado;
    });
  });

  //  Filtros internos (modales) 

  readonly filtrosInternosForm = this.fb.nonNullable.group({
    filtroPermisos: [''],
    filtroInterno: [''],
  });

  readonly filtroPermisos = toSignal(
    this.filtrosInternosForm.get('filtroPermisos')!.valueChanges,
    { initialValue: '' }
  );

  readonly filtroInterno = toSignal(
    this.filtrosInternosForm.get('filtroInterno')!.valueChanges,
    { initialValue: '' }
  );

  //  Configuración de permisos 

  readonly recursosFiltrados = computed(() => {
    const term = this.filtroPermisos().toLowerCase().trim();

    if (!term) {
      return this.recursos();
    }

    return this.recursos().filter(
      (r) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term) ||
        r.tipo.toLowerCase().includes(term)
    );
  });

  readonly recursosFiltradosIndices = computed(() => {
    const term = this.filtroPermisos().toLowerCase().trim();

    if (!term) {
      return this.recursos().map((_, i) => i);
    }

    return this.recursos()
      .map((r, i) => ({ r, i }))
      .filter(
        ({ r }) =>
          r.nombre.toLowerCase().includes(term) ||
          r.codigo.toLowerCase().includes(term) ||
          (r.descripcion ?? '').toLowerCase().includes(term) ||
          r.tipo.toLowerCase().includes(term)
      )
      .map(({ i }) => i);
  });

  //  Configuración de la tabla 

  readonly tableColumnTitle = ['Nombre', 'Descripción', 'Estado', 'Acciones'];
  readonly columnsToDisplay = ['nombre', 'descripcion', 'estado', 'acciones'];

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.ROLES_CREAR);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.ROLES_EDITAR);

  readonly headerButtons = computed<HeaderButton[]>(() => {
    const btns: HeaderButton[] = [];

    if (this.canCreate) {
      btns.push({
        text: 'Nuevo rol',
        icon: 'bi bi-app-indicator',
        class: ['btn', 'btn-primary'],
        type: 'button',
        action: 'NUEVA',
      });
    }

    return btns;
  });

  readonly tableData = computed<ColumnConfig[]>(() =>
    this.filteredRoles().map((r) => this.buildRow(r))
  );

  private buildRow(r: RolResponseDTO): ColumnConfig {
    const buttons: ActionButton[] = [];
    const activo = r.estado === Estado.ACTIVO;

    if (activo) {
      buttons.push({
        label: '',
        action: 'VER_USUARIOS',
        title: 'Ver usuarios asociados',
        icon: 'bi bi-people',
        class: 'btn-action-users',
        type: 'button',
      });
    }

    if (this.canEdit) {
      if (activo) {
        buttons.push({
          label: '',
          action: 'EDITAR',
          title: 'Editar rol',
          icon: 'bi bi-pencil-square',
          class: 'btn-action-edit',
          type: 'button',
        });

        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Inactivar rol',
          icon: 'bi bi-toggle-off',
          class: 'btn-action-deactivate',
          type: 'button',
        });
      } else {
        buttons.push({
          label: '',
          action: 'VER_DETALLE',
          title: 'Ver detalle del rol',
          icon: 'bi bi-eye',
          class: 'btn-action-view',
          type: 'button',
        });

        buttons.push({
          label: '',
          action: 'TOGGLE',
          title: 'Activar rol',
          icon: 'bi bi-toggle-on',
          class: 'btn-action-activate',
          type: 'button',
        });
      }
    }

    return {
      _role: r,
      nombre: { typeColum: typeColum.string, columValue: r.nombre },
      descripcion: { typeColum: typeColum.string, columValue: r.descripcion || '—' },
      estado: {
        typeColum: typeColum.status,
        columValue: r.estado,
        satusValue: activo,
      },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const role: RolResponseDTO = event.row._role;

    if (event.action === 'VER_DETALLE') {
      this.abrirDetalleRol(role);
    } else if (event.action === 'EDITAR') {
      this.abrirEditar(role);
    } else if (event.action === 'TOGGLE') {
      this.toggleEstado(role);
    } else if (event.action === 'VER_USUARIOS') {
      this.abrirUsuariosRol(role);
    }
  }

  //  Formulario de rol 

  readonly editingRole = signal<RolResponseDTO | null>(null);
  readonly saving = signal(false);

  roleForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    nombre: [{ type: 'required', message: 'El nombre del rol es obligatorio.' }],
  };

  //  Confirmación toggle 

  readonly confirmVisible = signal(false);
  readonly confirmRole = signal<RolResponseDTO | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  //  Ciclo de vida 

  constructor() {
    effect(() => {
      this.filtroInterno();
      this.currentPageUsuarios.set(1);
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));

    this.apliId.set(id);

    this.roleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      estado: [true],
      permisos: this.fb.array([], minSelectedValidator()),
    });

    this.searchUsuarioForm = this.fb.group({
      usuarioRed: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.seleccionForm = this.fb.group({
      selectAll: [false],
      usuarios: this.fb.array([]),
    });

    this.cargar();
    this.cargarRecursos();
  }

  get permisosArray(): FormArray {
    return this.roleForm.get('permisos') as FormArray;
  }

  //  Carga de datos 

  cargar(): void {
    this.loading.set(true);

    this.roleService.listarRoles(this.apliId()).subscribe({
      next: (res) => {
        this.roles.set(res.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('ERROR API ROLES:', error);
        this.roles.set([]);
        this.loading.set(false);
      },
    });
  }

  cargarRecursos(): void {
    this.recursosService.listarRecursos(this.apliId(), Estado.ACTIVO).subscribe({
      next: (res) => {
        this.recursos.set(res.data ?? []);
        this.buildPermisosCheckboxes();
      },
      error: (error) => {
        console.error('ERROR API RECURSOS:', error);
        this.recursos.set([]);
        this.buildPermisosCheckboxes();
      },
    });
  }

    limpiarFiltros(): void {
    this.searchForm.reset({ search: '' });
    this.estadoFiltro.reset('');
  }
  //  Permisos (checkboxes) 

  private buildPermisosCheckboxes(selectedIds: number[] = []): void {
    const array = this.permisosArray;

    array.clear();

    this.recursos().forEach(() => {
      array.push(this.fb.control(false));
    });

    if (selectedIds.length > 0) {
      this.recursos().forEach((r, i) => {
        if (selectedIds.includes(r.id)) {
          array.at(i).setValue(true);
        }
      });
    }

    array.updateValueAndValidity();
  }

  togglePermiso(index: number, checked: boolean): void {
    this.permisosArray.at(index).setValue(checked);
    this.permisosArray.at(index).markAsTouched();
    this.permisosArray.updateValueAndValidity();
  }

  toggleSelectAllPermisos(checked: boolean): void {
    const indices = this.recursosFiltradosIndices();

    indices.forEach((i) => {
      this.permisosArray.at(i).setValue(checked);
    });

    this.permisosArray.updateValueAndValidity();
  }

  get selectAllPermisosState(): boolean | null {
    const indices = this.recursosFiltradosIndices();

    if (indices.length === 0) {
      return false;
    }

    const values = indices.map((i) => this.permisosArray.at(i).value);
    const allTrue = values.every((v) => v === true);
    const allFalse = values.every((v) => v === false);

    if (allTrue) return true;
    if (allFalse) return false;
    return null;
  }

  get allPermisosSelected(): boolean {
    return this.selectAllPermisosState === true;
  }

  get cantidadSeleccionadosPermisos(): number {
    return this.permisosArray.value.filter((v: boolean) => v).length;
  }

  private getSelectedPermisosIds(): number[] {
    const ids: number[] = [];

    this.permisosArray.value.forEach((v: boolean, i: number) => {
      if (v && this.recursos()[i]) {
        ids.push(this.recursos()[i].id);
      }
    });

    return ids;
  }

  get permisosInvalid(): boolean {
    return this.permisosArray.hasError('minSelected') && this.permisosArray.touched;
  }

  //  Abrir / cerrar modal 

  abrirCrear(): void {
    this.editingRole.set(null);
    this.filtrosInternosForm.get('filtroPermisos')?.setValue('');

    this.roleForm?.reset({ nombre: '', descripcion: '', estado: true });
    this.buildPermisosCheckboxes([]);

    this.modalForm?.open();
  }

  abrirEditar(role: RolResponseDTO): void {
    this.editingRole.set(role);
    this.filtrosInternosForm.get('filtroPermisos')?.setValue('');

    this.roleForm?.patchValue({
      nombre: role.nombre,
      descripcion: role.descripcion ?? '',
      estado: role.estado === Estado.ACTIVO,
    });

    const cached = this.roleDetalleCache()[role.id];

    if (cached) {
      this.buildPermisosCheckboxes(cached);
    } else {
      this.roleService.obtenerDetalleRol(role.id).subscribe({
        next: (res) => {
          const assignedIds = (res.data?.recursos ?? []).map((recurso) => recurso.recuId);

          this.roleDetalleCache.update((cache) => ({
            ...cache,
            [role.id]: assignedIds,
          }));

          this.buildPermisosCheckboxes(assignedIds);
        },
        error: (error) => {
          console.error('ERROR AL OBTENER DETALLE DEL ROL:', error);

          this.roleDetalleCache.update((cache) => ({
            ...cache,
            [role.id]: [],
          }));

          this.buildPermisosCheckboxes([]);
        },
      });
    }

    this.modalForm?.open();
  }

  cerrarForm(): void {
    this.modalForm?.close();
  }

  //  Guardar (crear / editar) 

  guardar(): void {
    if (this.saving()) return;

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.roleForm.getRawValue();
    const role = this.editingRole();
    const selectedIds = this.getSelectedPermisosIds();

    if (!role) {
      const request: CrearRolRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        recursos: selectedIds,
      };

      this.roleService.crearRol(this.apliId(), request, this.auth.usuarioRed()).subscribe({
        next: () => {
          this.saving.set(false);
          this.cerrarForm();
          this.cargar();
        },
        error: (error) => {
          console.error('ERROR AL CREAR ROL:', error);
          this.saving.set(false);
        },
      });

      return;
    }

    this.editarRol(role.id, formValue.nombre, formValue.descripcion, formValue.estado, selectedIds);
  }

  private editarRol(
    rolId: number,
    nombre: string,
    descripcion: string,
    estado: boolean,
    selectedIds: number[]
  ): void {
    const cached = this.roleDetalleCache()[rolId];

    const currentIds$: Observable<number[]> = cached
      ? of(cached)
      : this.roleService
          .obtenerDetalleRol(rolId)
          .pipe(switchMap((res) => of((res.data?.recursos ?? []).map((r) => r.recuId))));

    currentIds$.subscribe({
      next: (currentIds) => {
        const recursosAsignar = selectedIds.filter((id) => !currentIds.includes(id));
        const recursosRetirar = currentIds.filter((id) => !selectedIds.includes(id));

        const modificarRequest: ModificarRolRequest = {
          nombre,
          descripcion,
          estado,
        };

        this.roleService
          .modificarRol(this.apliId(), rolId, modificarRequest, this.auth.usuarioRed())
          .pipe(
            switchMap((modificarRes) => {
              const tareas: Observable<any>[] = [];

              if (recursosAsignar.length > 0) {
                tareas.push(
                  this.roleService.asignarRecursos(
                    rolId,
                    { recursos: recursosAsignar },
                    this.auth.usuarioRed()
                  )
                );
              }

              if (recursosRetirar.length > 0) {
                tareas.push(
                  this.roleService.retirarRecursos(
                    rolId,
                    { recursos: recursosRetirar },
                    this.auth.usuarioRed()
                  )
                );
              }

              return tareas.length > 0
                ? forkJoin({
                    modificar: of(modificarRes),
                    recursos: forkJoin(tareas),
                  })
                : of({ modificar: modificarRes, recursos: null });
            })
          )
          .subscribe({
            next: () => {
              this.roleDetalleCache.update((cache) => {
                const { [rolId]: _, ...rest } = cache;
                return rest;
              });

              this.saving.set(false);
              this.cerrarForm();
              this.cargar();
            },
            error: (error) => {
              console.error('ERROR AL EDITAR ROL:', error);
              this.saving.set(false);
            },
          });
      },
      error: (error) => {
        console.error('ERROR AL OBTENER RECURSOS ACTUALES DEL ROL:', error);
        this.saving.set(false);
      },
    });
  }

  //  Toggle estado 

  toggleEstado(role: RolResponseDTO): void {
    const activo = role.estado === Estado.ACTIVO;

    this.confirmRole.set(role);
    this.confirmTitle.set(activo ? 'Inactivar rol' : 'Activar rol');
    this.confirmMsg.set(
      activo
        ? `¿Desea inactivar el rol "${role.nombre}"? Los usuarios con este rol no tendrán acceso hasta ser activado nuevamente.`
        : `¿Desea activar el rol "${role.nombre}"?`
    );
    this.confirmVisible.set(true);
  }

  ejecutarToggle(): void {
    const role = this.confirmRole();
    if (!role) return;

    this.confirmVisible.set(false);

    const nuevoEstado = role.estado !== Estado.ACTIVO;

    const request: ModificarRolRequest = {
      nombre: role.nombre,
      descripcion: role.descripcion ?? '',
      estado: nuevoEstado,
    };

    this.roleService
      .modificarRol(this.apliId(), role.id, request, this.auth.usuarioRed())
      .subscribe({
        next: () => this.cargar(),
        error: (err) => console.error('ERROR AL CAMBIAR ESTADO:', err),
      });
  }

  //  Modal de Detalle del Rol 

  readonly rolDetalle = signal<RolResponseDTO | null>(null);
  readonly permisosRol = signal<RecursosRolResponse[]>([]);
  readonly cargandoDetalleRol = signal(false);

  readonly usuariosAsignadosDetalle = signal<UsuarioAsignadoRol[]>([]);
  readonly cargandoUsuariosDetalle = signal(false);

  abrirDetalleRol(role: RolResponseDTO): void {
    this.rolDetalle.set(role);
    this.permisosRol.set([]);
    this.usuariosAsignadosDetalle.set([]);
    this.cargandoDetalleRol.set(true);
    this.cargandoUsuariosDetalle.set(true);

    this.modalDetalle?.open();

    this.roleService.obtenerDetalleRol(role.id).subscribe({
      next: (res) => {
        this.permisosRol.set(res.data?.recursos ?? []);
        this.cargandoDetalleRol.set(false);
      },
      error: (err) => {
        console.error('ERROR AL OBTENER DETALLE DEL ROL:', err);
        this.permisosRol.set([]);
        this.cargandoDetalleRol.set(false);
      },
    });

    this.userService.listarUsuariosPorRol(role.id).subscribe({
      next: (usuarios) => {
        this.usuariosAsignadosDetalle.set(usuarios);
        this.cargandoUsuariosDetalle.set(false);
      },
      error: (err) => {
        console.error('ERROR AL CARGAR USUARIOS DEL ROL:', err);
        this.usuariosAsignadosDetalle.set([]);
        this.cargandoUsuariosDetalle.set(false);
      },
    });
  }

  cerrarDetalleRol(): void {
    this.rolDetalle.set(null);
    this.permisosRol.set([]);
    this.usuariosAsignadosDetalle.set([]);
    this.modalDetalle?.close();
  }

  //  Modal de Usuarios por Rol 

  readonly rolSeleccionado = signal<RolResponseDTO | null>(null);
  readonly usuariosRol = signal<UsuarioAsignadoRol[]>([]);
  readonly usuarioBuscado = signal<UsuarioResponseDTO | null>(null);
  readonly buscandoUsuario = signal(false);
  readonly searchUsuarioError = signal('');

  readonly cargandoUsuariosRol = signal(false);
  readonly ejecutandoAccion = signal(false);

  // ✅ Nuevas señales para mensajes de éxito
  readonly mensajeExito = signal('');
  private exitTimer?: ReturnType<typeof setTimeout>;

  readonly confirmQuitarVisible = signal(false);
  readonly confirmQuitarMsg = signal('');
  readonly usuariosAQuitar = signal<UsuarioAsignadoRol[]>([]);
  readonly quitandoUsuarios = signal(false);

  readonly confirmAsociarVisible = signal(false);
  readonly confirmAsociarTitle = signal('');
  readonly confirmAsociarMsg = signal('');
  readonly modoActivarYAsociar = signal(false);

  readonly rolSeleccionadoActivo = computed(
    () => this.rolSeleccionado()?.estado === Estado.ACTIVO
  );

  readonly usuariosFiltrados = computed(() => {
    const term = this.filtroInterno().toLowerCase().trim();

    if (!term) return this.usuariosRol();

    return this.usuariosRol().filter(
      (u) =>
        u.usuarioRed.toLowerCase().includes(term) ||
        u.nombre.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term)
    );
  });

  readonly currentPageUsuarios = signal(1);
  readonly itemsPerPageUsuarios = 10;

  readonly totalPagesUsuarios = computed(
    () => Math.ceil(this.usuariosFiltrados().length / this.itemsPerPageUsuarios) || 1
  );

  readonly paginatedUsuarios = computed(() => {
    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios;
    return this.usuariosFiltrados().slice(start, start + this.itemsPerPageUsuarios);
  });

  readonly rangoMostrado = computed(() => {
    const total = this.usuariosFiltrados().length;

    if (total === 0) return '0 usuarios';

    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios + 1;
    const end = Math.min(this.currentPageUsuarios() * this.itemsPerPageUsuarios, total);

    return `Mostrando ${start}-${end} de ${total.toLocaleString('es-CO')} usuario(s) asignado(s)`;
  });

  readonly selectedIndices = signal<Set<number>>(new Set());

  searchUsuarioForm!: FormGroup;
  seleccionForm!: FormGroup;

  get seleccionArray(): FormArray {
    return this.seleccionForm.get('usuarios') as FormArray;
  }

  abrirUsuariosRol(role: RolResponseDTO): void {
    this.rolSeleccionado.set(role);
    this.usuarioBuscado.set(null);
    this.mensajeExito.set('');
    this.filtrosInternosForm.get('filtroInterno')?.setValue('');
    this.currentPageUsuarios.set(1);
    this.selectedIndices.set(new Set());

    if (role.estado !== Estado.ACTIVO) {
      this.searchUsuarioError.set(
        `El rol "${role.nombre}" no está habilitado. Actívelo antes de gestionar usuarios.`
      );
    } else {
      this.searchUsuarioError.set('');
    }

    this.searchUsuarioForm.reset({ usuarioRed: '' });
    this.searchUsuarioForm.get('usuarioRed')?.markAsUntouched();
    this.searchUsuarioForm.get('usuarioRed')?.markAsPristine();

    this.seleccionForm.reset({ selectAll: false });
    this.seleccionArray.clear();

    this.modalUsuarios?.open();

    this.cargarUsuariosRol(role.id);
  }

  cargarUsuariosRol(rolId: number): void {
    this.cargandoUsuariosRol.set(true);

    this.userService.listarUsuariosPorRol(rolId).subscribe({
      next: (usuarios) => {
        this.usuariosRol.set(usuarios);
        this.currentPageUsuarios.set(1);
        this.selectedIndices.set(new Set());
        this.seleccionForm.get('selectAll')?.setValue(false);
        this.cargandoUsuariosRol.set(false);
      },
      error: (err) => {
        console.error('ERROR AL CARGAR USUARIOS DEL ROL:', err);
        this.cargandoUsuariosRol.set(false);
      },
    });
  }

  onPageChangeUsuarios(page: number): void {
    this.currentPageUsuarios.set(page);
  }

  isUsuarioSelected(globalIndex: number): boolean {
    return this.selectedIndices().has(globalIndex);
  }

  toggleSeleccionUsuario(globalIndex: number, checked: boolean): void {
    if (!this.rolSeleccionadoActivo()) return;

    const current = new Set(this.selectedIndices());

    if (checked) {
      current.add(globalIndex);
    } else {
      current.delete(globalIndex);
    }

    this.selectedIndices.set(current);
    this.updateSelectAllState();
  }

  toggleSelectAll(checked: boolean): void {
    if (!this.rolSeleccionadoActivo()) return;

    const current = new Set(this.selectedIndices());

    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios;
    const end = Math.min(start + this.itemsPerPageUsuarios, this.usuariosFiltrados().length);

    for (let i = start; i < end; i++) {
      if (checked) {
        current.add(i);
      } else {
        current.delete(i);
      }
    }

    this.selectedIndices.set(current);
  }

  private updateSelectAllState(): void {
    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios;
    const end = Math.min(start + this.itemsPerPageUsuarios, this.usuariosFiltrados().length);

    let allSelected = true;

    for (let i = start; i < end; i++) {
      if (!this.selectedIndices().has(i)) {
        allSelected = false;
        break;
      }
    }

    this.seleccionForm.get('selectAll')?.setValue(allSelected, { emitEvent: false });
  }

  get haySeleccionados(): boolean {
    return this.selectedIndices().size > 0;
  }

  get cantidadSeleccionados(): number {
    return this.selectedIndices().size;
  }

  //  Retirar usuarios 

  quitarSeleccionados(): void {
    const role = this.rolSeleccionado();
    if (!role) return;

    if (role.estado !== Estado.ACTIVO) {
      this.searchUsuarioError.set(
        `El rol "${role.nombre}" no está habilitado. Actívelo antes de quitar usuarios.`
      );
      return;
    }

    const usuarios = this.usuariosFiltrados();
    const indices = Array.from(this.selectedIndices()).sort((a, b) => a - b);

    const seleccionados = indices
      .map((i) => usuarios[i])
      .filter((u): u is UsuarioAsignadoRol => !!u);

    if (seleccionados.length === 0) return;

    this.usuariosAQuitar.set(seleccionados);
    this.confirmQuitarMsg.set(
      `¿Desea quitar ${seleccionados.length} usuario(s) de este rol? Esta acción no se puede deshacer.`
    );
    this.confirmQuitarVisible.set(true);
  }

  ejecutarQuitarUsuarios(): void {
    const role = this.rolSeleccionado();
    const usuarios = this.usuariosAQuitar();

    if (!role || usuarios.length === 0) return;

    this.confirmQuitarVisible.set(false);
    this.quitandoUsuarios.set(true);

    const usuariosIds = usuarios.map((u) => u.id);
    const total = usuarios.length;

    this.userService
      .retirarRoles(this.apliId(), usuariosIds, this.auth.usuarioRed())
      .subscribe({
        next: () => {
          this.quitandoUsuarios.set(false);
          this.usuariosAQuitar.set([]);
          this.selectedIndices.set(new Set());
          this.searchUsuarioError.set('');

          // ✅ Mensaje de éxito
          this.mostrarExito(
            `${total} usuario(s) fueron retirados del rol "${role.nombre}" correctamente.`
          );

          this.cargarUsuariosRol(role.id);
        },
        error: (err) => {
          console.error('ERROR AL QUITAR USUARIOS:', err);
          this.quitandoUsuarios.set(false);

          const msg =
            err?.error?.mensaje ||
            err?.error?.message ||
            'No se pudieron quitar los usuarios del rol.';

          this.searchUsuarioError.set(msg);
        },
      });
  }

  cancelarQuitarUsuarios(): void {
    this.confirmQuitarVisible.set(false);
    this.usuariosAQuitar.set([]);
  }

  //  Buscar / asociar usuario 

  buscarUsuarioRol(): void {
    const role = this.rolSeleccionado();
    if (!role) return;

    if (role.estado !== Estado.ACTIVO) {
      this.searchUsuarioError.set(
        `El rol "${role.nombre}" no está habilitado. Actívelo antes de asignar usuarios.`
      );
      return;
    }

    const usuarioRed = this.searchUsuarioForm.get('usuarioRed')?.value?.trim();

    if (!usuarioRed || this.searchUsuarioForm.get('usuarioRed')?.invalid) {
      this.searchUsuarioError.set('Ingrese un usuario de red válido (mínimo 2 caracteres).');
      return;
    }

    this.buscandoUsuario.set(true);
    this.searchUsuarioError.set('');
    this.usuarioBuscado.set(null);
    this.mensajeExito.set('');

    this.userService.listarUsuarios({ usuarioRed }).subscribe({
      next: (res) => {
        const user = (res.data ?? [])[0];

        if (!user) {
          this.buscandoUsuario.set(false);
          this.searchUsuarioError.set(
            `No se encontró ningún usuario con usuarioRed "${usuarioRed}".`
          );
          return;
        }

        const yaAsignado = this.usuariosRol().some(
          (u) => u.usuarioRed === user.usuarioRed
        );

        if (yaAsignado) {
          this.buscandoUsuario.set(false);
          this.searchUsuarioError.set(
            `El usuario "${user.usuarioRed}" ya está asignado a este rol.`
          );
          return;
        }

        this.userService
          .obtenerRolUsuario(this.apliId(), user.usuarioRed)
          .subscribe({
            next: (asignacion) => {
              this.buscandoUsuario.set(false);

              const yaTieneRol = asignacion !== null && asignacion.rolId != null;

              if (yaTieneRol) {
                this.usuarioBuscado.set(null);
                this.searchUsuarioError.set(
                  `El usuario "${user.usuarioRed}" ya tiene un rol asignado en la aplicación.`
                );
              } else {
                this.usuarioBuscado.set(user);
              }
            },
            error: () => {
              this.buscandoUsuario.set(false);
              this.usuarioBuscado.set(user);
            },
          });
      },
      error: () => {
        this.buscandoUsuario.set(false);
        this.searchUsuarioError.set('Error al buscar el usuario.');
      },
    });
  }

  confirmarAsociarUsuario(): void {
    const user = this.usuarioBuscado();
    const role = this.rolSeleccionado();
    if (!user || !role) return;

    if (role.estado !== Estado.ACTIVO) {
      this.searchUsuarioError.set(
        `El rol "${role.nombre}" no está habilitado. Actívelo antes de asignar usuarios.`
      );
      return;
    }

    const inactivo = user.estado !== EstadoUsuario.ACTIVO;

    this.modoActivarYAsociar.set(inactivo);
    this.confirmAsociarTitle.set(inactivo ? 'Activar y asociar rol' : 'Asociar rol');
    this.confirmAsociarMsg.set(
      inactivo
        ? `El usuario "${user.usuarioRed}" está inactivo. Al confirmar, se activará y se le asignará el rol "${role.nombre}".`
        : `¿Desea asignar el rol "${role.nombre}" al usuario "${user.usuarioRed}"?`
    );
    this.confirmAsociarVisible.set(true);
  }

  cancelarAsociarUsuario(): void {
    this.confirmAsociarVisible.set(false);
    this.modoActivarYAsociar.set(false);
  }

  ejecutarAsociarUsuario(): void {
    const user = this.usuarioBuscado();
    const role = this.rolSeleccionado();
    if (!user || !role) return;

    this.confirmAsociarVisible.set(false);
    this.ejecutandoAccion.set(true);
    this.searchUsuarioError.set('');

    const activarPrimero = this.modoActivarYAsociar();
    const usuarioRed = user.usuarioRed;
    const rolId = role.id;
    const nombreRol = role.nombre;

    const operacion$: Observable<any> = activarPrimero
      ? this.userService.gestionarEstadoUsuario(
          {
            apliId: this.apliId(),
            usuarioRed,
            operacion: this.OPERACION_ACTIVAR_USUARIO,
            rolId,
          } as GestionarEstadoUsuarioRequest,
          this.auth.usuarioRed()
        )
      : this.userService.asignarRol(
          this.apliId(),
          { usuarioRed, rolId },
          this.auth.usuarioRed()
        );

    operacion$.subscribe({
      next: () => {
        this.ejecutandoAccion.set(false);
        this.modoActivarYAsociar.set(false);
        this.usuarioBuscado.set(null);
        this.searchUsuarioForm.reset({ usuarioRed: '' });

        // Mensaje de éxito
        this.mostrarExito(
          activarPrimero
            ? `El usuario "${usuarioRed}" fue activado y se le asignó el rol "${nombreRol}" correctamente.`
            : `El rol "${nombreRol}" fue asignado al usuario "${usuarioRed}" correctamente.`
        );

        this.cargarUsuariosRol(rolId);
      },
      error: (err) => {
        this.ejecutandoAccion.set(false);

        const msg =
          err?.error?.mensaje ||
          err?.error?.message ||
          (activarPrimero
            ? `No se pudo activar y asociar el rol al usuario "${usuarioRed}".`
            : `No se pudo asociar el rol al usuario "${usuarioRed}".`);

        this.searchUsuarioError.set(msg);
      },
    });
  }

  //  Mensaje de éxito (auto-cierre) 

  private mostrarExito(mensaje: string): void {
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
    }

    this.mensajeExito.set(mensaje);

    this.exitTimer = setTimeout(() => {
      this.mensajeExito.set('');
      this.exitTimer = undefined;
    }, 5000);
  }

  cerrarMensajeExito(): void {
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = undefined;
    }
    this.mensajeExito.set('');
  }

  cerrarUsuariosModal(): void {
    this.rolSeleccionado.set(null);
    this.usuariosRol.set([]);
    this.usuarioBuscado.set(null);
    this.searchUsuarioError.set('');
    this.mensajeExito.set('');
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = undefined;
    }
    this.filtrosInternosForm.get('filtroInterno')?.setValue('');
    this.selectedIndices.set(new Set());
    this.confirmQuitarVisible.set(false);
    this.usuariosAQuitar.set([]);
    this.confirmAsociarVisible.set(false);
    this.modoActivarYAsociar.set(false);
    this.ejecutandoAccion.set(false);
    this.modalUsuarios?.close();
  }
}