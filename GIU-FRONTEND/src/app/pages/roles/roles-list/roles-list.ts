import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { Role } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';

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
  RecursoResponseDTO,
  RecursosRolResponse,
} from '../../../models/api/roles.model';
import {
  AsignarRolRequest,
  UsuarioAsignadoRol,
  UsuarioResponseDTO,
} from '../../../models/api/users.model';

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
    HeaderPagesComponent,
    SelectComponent,
  ],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss',
})
export class RolesList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // ==================== Estado general ====================

  readonly loading = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly apliId = signal(0);

  /** Recursos/permisos disponibles para la aplicación. */
  readonly recursos = signal<RecursoResponseDTO[]>([]);

  /** Cache de recursos asignados por rol (evita repetir obtenerDetalleRol). */
  private readonly roleDetalleCache = signal<Record<number, number[]>>({});

  // ==================== Filtros ====================

  readonly searchForm = this.fb.nonNullable.group({
    search: [''],
  });

  readonly searchSignal = toSignal(this.searchForm.get('search')!.valueChanges, {
    initialValue: '',
  });

  readonly estadoOptions = [
    { id: 'ACTIVO', nombre: 'Activo' },
    { id: 'INACTIVO', nombre: 'Inactivo' },
  ];

  readonly estadoFiltro = new FormControl('', { nonNullable: true });

  readonly estadoFiltroSignal = toSignal(this.estadoFiltro.valueChanges, {
    initialValue: '',
  });

  /** Roles filtrados reactivamente por texto y estado. */
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

  // ==================== Configuración de permisos ====================

  /** Búsqueda interna de permisos en tiempo real. */
  readonly filtroPermisos = signal('');

  /** Permisos filtrados por la búsqueda interna. */
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

  /** Índices globales de los permisos filtrados para mapear al FormArray. */
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

  // ==================== Configuración de la tabla ====================

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

  private buildRow(r: Role): ColumnConfig {
    const buttons: ActionButton[] = [];

    buttons.push({
      label: 'Usuarios',
      action: 'VER_USUARIOS',
      title: 'Ver usuarios asociados',
      icon: 'bi bi-people',
      class: 'btn-table-view',
      type: 'button',
    });

    buttons.push({
      label: 'Ver detalle',
      action: 'VER_DETALLE',
      title: 'Ver detalle del rol',
      icon: 'bi bi-eye',
      class: 'btn-table-view',
      type: 'button',
    });

    if (this.canEdit) {
      buttons.push({
        label: 'Editar',
        action: 'EDITAR',
        title: 'Editar rol',
        icon: 'bi bi-pencil-square',
        class: 'btn-table-edit',
        type: 'button',
      });

      buttons.push({
        label: r.estado === 'ACTIVO' ? 'Inactivar' : 'Activar',
        action: 'TOGGLE',
        title: r.estado === 'ACTIVO' ? 'Inactivar rol' : 'Activar rol',
        icon: r.estado === 'ACTIVO' ? 'bi bi-toggle-on' : 'bi bi-toggle-off',
        class: r.estado === 'ACTIVO' ? 'btn-table-danger' : 'btn-table-success',
        type: 'button',
      });
    }

    return {
      _role: r,
      nombre: {
        typeColum: typeColum.string,
        columValue: r.nombre,
      },
      descripcion: {
        typeColum: typeColum.string,
        columValue: r.descripcion || '—',
      },
      estado: {
        typeColum: typeColum.status,
        columValue: r.estado,
        satusValue: r.estado === 'ACTIVO',
      },
      acciones: {
        typeColum: typeColum.button,
        actionButtons: buttons,
      },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const role: Role = event.row._role;

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

  // ==================== Formulario de rol ====================

  readonly showForm = signal(false);
  readonly editingRole = signal<Role | null>(null);
  readonly saving = signal(false);

  roleForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    nombre: [
      {
        type: 'required',
        message: 'El nombre del rol es obligatorio.',
      },
    ],
  };

  // ==================== Confirmación toggle ====================

  readonly confirmVisible = signal(false);
  readonly confirmRole = signal<Role | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  // ==================== Ciclo de vida ====================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));

    this.apliId.set(id);

    this.roleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      permisos: this.fb.array([], minSelectedValidator()),
    });

    this.cargar();
    this.cargarRecursos();
  }

  /** Acceso al FormArray de permisos desde el template. */
  get permisosArray(): FormArray {
    return this.roleForm.get('permisos') as FormArray;
  }

  // ==================== Carga de datos ====================

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
    this.roleService.listarRecursos(this.apliId()).subscribe({
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

  // ==================== Permisos (checkboxes) ====================

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

  /** Filtra los permisos en tiempo real. */
  filtrarPermisos(term: string): void {
    this.filtroPermisos.set(term);
  }

  /** Selecciona/deselecciona todos los permisos visibles. */
  toggleSelectAllPermisos(checked: boolean): void {
    const indices = this.recursosFiltradosIndices();

    indices.forEach((i) => {
      this.permisosArray.at(i).setValue(checked);
    });

    this.permisosArray.updateValueAndValidity();
  }

  /** Estado del checkbox "Seleccionar todos". */
  get selectAllPermisosState(): boolean | null {
    const indices = this.recursosFiltradosIndices();

    if (indices.length === 0) {
      return false;
    }

    const values = indices.map((i) => this.permisosArray.at(i).value);

    const allTrue = values.every((v) => v === true);
    const allFalse = values.every((v) => v === false);

    if (allTrue) {
      return true;
    }

    if (allFalse) {
      return false;
    }

    return null;
  }

  /** True si todos los permisos visibles están seleccionados. */
  get allPermisosSelected(): boolean {
    return this.selectAllPermisosState === true;
  }

  /** Cantidad de permisos seleccionados. */
  get cantidadSeleccionadosPermisos(): number {
    return this.permisosArray.value.filter((v: boolean) => v).length;
  }

  /** Retorna los IDs de los recursos seleccionados. */
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

  // ==================== Abrir / cerrar modal ====================

  abrirCrear(): void {
    this.editingRole.set(null);
    this.filtroPermisos.set('');

    this.roleForm?.reset({
      nombre: '',
      descripcion: '',
    });

    this.buildPermisosCheckboxes([]);

    this.showForm.set(true);
  }

  abrirEditar(role: Role): void {
    this.editingRole.set(role);

    // Limpia la búsqueda interna al abrir el modal
    this.filtroPermisos.set('');

    this.roleForm?.patchValue({
      nombre: role.nombre,
      descripcion: role.descripcion ?? '',
    });

    // Cargar los permisos actualmente asignados al rol
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

    this.showForm.set(true);
  }

  cerrarForm(): void {
    this.showForm.set(false);
  }

  // ==================== Guardar (crear / editar) ====================

  guardar(): void {
    // Guard de reentrada: evita doble envío
    if (this.saving()) {
      return;
    }

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.roleForm.getRawValue();
    const role = this.editingRole();
    const selectedIds = this.getSelectedPermisosIds();

    if (!role) {
      // CREAR
      const request: CrearRolRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        recursos: selectedIds,
      };

      this.roleService.crearRol(this.apliId(), request, this.auth.usuarioRed()).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.cargar();
        },
        error: (error) => {
          console.error('ERROR AL CREAR ROL:', error);
          this.saving.set(false);
        },
      });

      return;
    }

    // EDITAR
    this.editarRol(role.id, formValue.nombre, formValue.descripcion, selectedIds);
  }

  private editarRol(
    rolId: number,
    nombre: string,
    descripcion: string,
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

        const estadoActual = this.editingRole()?.estado === 'ACTIVO';

        const modificarRequest: ModificarRolRequest = {
          nombre,
          descripcion,
          estado: estadoActual,
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
                : of({
                    modificar: modificarRes,
                    recursos: null,
                  });
            })
          )
          .subscribe({
            next: () => {
              // Invalidamos cache del rol editado
              this.roleDetalleCache.update((cache) => {
                const { [rolId]: _, ...rest } = cache;
                return rest;
              });

              this.saving.set(false);
              this.showForm.set(false);
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

  // ==================== Toggle estado ====================

  toggleEstado(role: Role): void {
    this.confirmRole.set(role);

    this.confirmTitle.set(role.estado === 'ACTIVO' ? 'Inactivar rol' : 'Activar rol');

    this.confirmMsg.set(
      role.estado === 'ACTIVO'
        ? `¿Desea inactivar el rol "${role.nombre}"? Los usuarios con este rol no tendrán acceso hasta ser activado nuevamente.`
        : `¿Desea activar el rol "${role.nombre}"?`
    );

    this.confirmVisible.set(true);
  }

  ejecutarToggle(): void {
    const role = this.confirmRole();

    if (!role) {
      return;
    }

    this.confirmVisible.set(false);

    const nuevoEstado = role.estado !== 'ACTIVO';

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

  // ==================== Modal de Detalle del Rol ====================

  readonly showDetalleRol = signal(false);
  readonly rolDetalle = signal<Role | null>(null);
  readonly permisosRol = signal<RecursosRolResponse[]>([]);
  readonly cargandoDetalleRol = signal(false);

  abrirDetalleRol(role: Role): void {
    this.rolDetalle.set(role);
    this.permisosRol.set([]);
    this.showDetalleRol.set(true);
    this.cargandoDetalleRol.set(true);

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
  }

  cerrarDetalleRol(): void {
    this.showDetalleRol.set(false);
    this.rolDetalle.set(null);
    this.permisosRol.set([]);
  }

  // ==================== Modal de Usuarios por Rol ====================

  readonly showUsuariosModal = signal(false);
  readonly rolSeleccionado = signal<Role | null>(null);
  readonly usuariosRol = signal<UsuarioAsignadoRol[]>([]);
  readonly usuarioBuscado = signal<UsuarioResponseDTO | null>(null);
  readonly buscandoUsuario = signal(false);
  readonly searchUsuarioError = signal('');

  // ---- Confirmación de retiro ----
  readonly confirmQuitarVisible = signal(false);
  readonly confirmQuitarMsg = signal('');
  readonly usuariosAQuitar = signal<UsuarioAsignadoRol[]>([]);
  readonly quitandoUsuarios = signal(false);

  readonly filtroInterno = signal('');

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

    if (total === 0) {
      return '0 usuarios';
    }

    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios + 1;
    const end = Math.min(this.currentPageUsuarios() * this.itemsPerPageUsuarios, total);

    return `Mostrando ${start}-${end} de ${total.toLocaleString(
      'es-CO'
    )} usuario(s) asignado(s)`;
  });

  readonly selectedIndices = signal<Set<number>>(new Set());

  searchUsuarioForm!: FormGroup;
  seleccionForm!: FormGroup;

  private initUsuariosForms(): void {
    this.searchUsuarioForm = this.fb.group({
      usuarioRed: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.seleccionForm = this.fb.group({
      selectAll: [false],
      usuarios: this.fb.array([]),
    });
  }

  get seleccionArray(): FormArray {
    return this.seleccionForm.get('usuarios') as FormArray;
  }

  abrirUsuariosRol(role: Role): void {
    this.rolSeleccionado.set(role);
    this.usuarioBuscado.set(null);
    this.searchUsuarioError.set('');
    this.filtroInterno.set('');
    this.currentPageUsuarios.set(1);
    this.selectedIndices.set(new Set());

    this.initUsuariosForms();

    this.showUsuariosModal.set(true);

    this.cargarUsuariosRol(role.id);
  }

  cargarUsuariosRol(rolId: number): void {
    this.userService.listarUsuariosPorRol(rolId).subscribe({
      next: (usuarios) => {
        this.usuariosRol.set(usuarios);
        this.currentPageUsuarios.set(1);
        this.selectedIndices.set(new Set());
        this.seleccionForm.get('selectAll')?.setValue(false);
      },
      error: (err) => console.error('ERROR AL CARGAR USUARIOS DEL ROL:', err),
    });
  }

  filtrarUsuariosAsignados(term: string): void {
    this.filtroInterno.set(term);
    this.currentPageUsuarios.set(1);
  }

  onPageChangeUsuarios(page: number): void {
    this.currentPageUsuarios.set(page);
  }

  isUsuarioSelected(globalIndex: number): boolean {
    return this.selectedIndices().has(globalIndex);
  }

  toggleSeleccionUsuario(globalIndex: number, checked: boolean): void {
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

  // ==================== Retirar usuarios (individual y por lote) ====================

  /** Abre el confirm para quitar TODOS los seleccionados. */
  quitarSeleccionados(): void {
    const role = this.rolSeleccionado();
    if (!role) return;

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

  /** Abre el confirm para quitar UN solo usuario (botón de la fila). */
  quitarUsuario(usuario: UsuarioAsignadoRol): void {
    this.usuariosAQuitar.set([usuario]);
    this.confirmQuitarMsg.set(
      `¿Desea quitar a "${usuario.nombre}" (${usuario.usuarioRed}) de este rol?`
    );
    this.confirmQuitarVisible.set(true);
  }

  /** Ejecuta el DELETE real (llamado desde el confirm modal). */
  ejecutarQuitarUsuarios(): void {
    const role = this.rolSeleccionado();
    const usuarios = this.usuariosAQuitar();

    if (!role || usuarios.length === 0) return;

    this.confirmQuitarVisible.set(false);
    this.quitandoUsuarios.set(true);

    const requests: AsignarRolRequest[] = usuarios.map((u) => ({
      usuarioRed: u.usuarioRed,
      rolId: role.id,
    }));

    this.userService
      .retirarRoles(this.apliId(), requests, this.auth.usuarioRed())
      .subscribe({
        next: () => {
          this.quitandoUsuarios.set(false);
          this.usuariosAQuitar.set([]);
          this.selectedIndices.set(new Set());
          this.cargarUsuariosRol(role.id);
        },
        error: (err) => {
          console.error('ERROR AL QUITAR USUARIOS:', err);
          this.quitandoUsuarios.set(false);
        },
      });
  }

  cancelarQuitarUsuarios(): void {
    this.confirmQuitarVisible.set(false);
    this.usuariosAQuitar.set([]);
  }

  // ==================== Buscar / asociar usuario ====================

  buscarUsuarioRol(): void {
    const usuarioRed = this.searchUsuarioForm.get('usuarioRed')?.value?.trim();

    if (!usuarioRed || this.searchUsuarioForm.get('usuarioRed')?.invalid) {
      this.searchUsuarioError.set('Ingrese un usuario de red válido (mínimo 2 caracteres).');
      return;
    }

    this.buscandoUsuario.set(true);
    this.searchUsuarioError.set('');

    // GET /api/usuarios?usuarioRed=xxx
    this.userService.listarUsuarios({ usuarioRed }).subscribe({
      next: (res) => {
        this.buscandoUsuario.set(false);

        const lista = res.data ?? [];
        const user = lista[0]; // el filtro es exacto, debería venir 0 o 1

        if (!user) {
          this.usuarioBuscado.set(null);
          this.searchUsuarioError.set(
            `No se encontró ningún usuario con usuarioRed "${usuarioRed}".`
          );
          return;
        }

        const yaAsignado = this.usuariosRol().some(
          (u) => u.usuarioRed === user.usuarioRed
        );

        if (yaAsignado) {
          this.searchUsuarioError.set(
            `El usuario "${user.usuarioRed}" ya está asignado a este rol.`
          );
          this.usuarioBuscado.set(null);
        } else {
          this.usuarioBuscado.set(user);
        }
      },
      error: () => {
        this.buscandoUsuario.set(false);
        this.searchUsuarioError.set('Error al buscar el usuario.');
      },
    });
  }

  asociarUsuarioRol(): void {
    const user = this.usuarioBuscado();
    const role = this.rolSeleccionado();

    if (!user || !role) return;

    this.userService
      .asignarRol(
        this.apliId(),
        { usuarioRed: user.usuarioRed, rolId: role.id },
        this.auth.usuarioRed()
      )
      .subscribe({
        next: () => {
          this.usuarioBuscado.set(null);
          this.searchUsuarioForm.reset({ usuarioRed: '' });
          this.cargarUsuariosRol(role.id);
        },
        error: (err) => console.error('ERROR AL ASIGNAR ROL:', err),
      });
  }

  cerrarUsuariosModal(): void {
    this.showUsuariosModal.set(false);
    this.rolSeleccionado.set(null);
    this.usuariosRol.set([]);
    this.usuarioBuscado.set(null);
    this.searchUsuarioError.set('');
    this.filtroInterno.set('');
    this.selectedIndices.set(new Set());
    this.confirmQuitarVisible.set(false);
    this.usuariosAQuitar.set([]);
  }
}