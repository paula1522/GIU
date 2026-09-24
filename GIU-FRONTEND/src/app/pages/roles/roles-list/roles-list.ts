import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { UserMockService } from '../../../services/mock/user-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { Role, Resource, UserApplication, User } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { minSelectedValidator } from '../validators/min-selected.validator';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, ButtonComponent, CheckboxComponent, ConfirmModalComponent, HeaderPagesComponent],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss',
})
export class RolesList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleMockService);
  private readonly userService = inject(UserMockService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRoles = signal<Role[]>([]);
  readonly apliId = signal(0);

  /** Recursos/permisos disponibles para la aplicación. */
  readonly recursos = signal<Resource[]>([]);

  /** Búsqueda interna de permisos en tiempo real. */
  readonly filtroPermisos = signal('');

  /** Permisos filtrados por la búsqueda interna. */
  readonly recursosFiltrados = computed(() => {
    const term = this.filtroPermisos().toLowerCase().trim();
    if (!term) return this.recursos();
    return this.recursos().filter(
      (r) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term) ||
        r.tipo.toLowerCase().includes(term)
    );
  });

  /** Índices globales de los permisos filtrados (para mapear al FormArray). */
  readonly recursosFiltradosIndices = computed(() => {
    const term = this.filtroPermisos().toLowerCase().trim();
    if (!term) return this.recursos().map((_, i) => i);
    return this.recursos()
      .map((r, i) => ({ r, i }))
      .filter(({ r }) =>
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        (r.descripcion ?? '').toLowerCase().includes(term) ||
        r.tipo.toLowerCase().includes(term)
      )
      .map(({ i }) => i);
  });

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Nombre', 'Descripción', 'Estado', 'Acciones'];
  readonly columnsToDisplay = ['nombre', 'descripcion', 'estado', 'acciones'];


    /** Botones dinámicos para el header-pages. */
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


  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredRoles().map((r) => this.buildRow(r));
  });

  private buildRow(r: Role): ColumnConfig {
    const buttons: ActionButton[] = [];
    // Botón ver usuarios asociados
    buttons.push({ label: 'Usuarios', action: 'VER_USUARIOS', title: 'Ver usuarios asociados', icon: 'bi bi-people', styles: 'btn-table-view', type: 'button' });
    if (this.canEdit) {
      buttons.push({ label: 'Editar', action: 'EDITAR', title: 'Editar rol', icon: 'bi bi-pencil-square', styles: 'btn-table-edit', type: 'button' });
    }
    if (this.canEdit) {
      buttons.push({
        label: r.estado === 'ACTIVO' ? 'Inactivar' : 'Activar',
        action: 'TOGGLE',
        title: r.estado === 'ACTIVO' ? 'Inactivar rol' : 'Activar rol',
        icon: r.estado === 'ACTIVO' ? 'bi bi-toggle-on' : 'bi bi-toggle-off',
        styles: r.estado === 'ACTIVO' ? 'btn-table-danger' : 'btn-table-success',
        type: 'button',
      });
    }

    return {
      _role: r,
      nombre: { typeColum: typeColum.string, columValue: r.nombre },
      descripcion: { typeColum: typeColum.string, columValue: r.descripcion || '—' },
      estado: { typeColum: typeColum.status, columValue: r.estado, satusValue: r.estado === 'ACTIVO' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const role: Role = event.row._role;
    if (event.action === 'EDITAR') {
      this.abrirEditar(role);
    } else if (event.action === 'TOGGLE') {
      this.toggleEstado(role);
    } else if (event.action === 'VER_USUARIOS') {
      this.abrirUsuariosRol(role);
    }
  }

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.ROLES_CREAR);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.ROLES_EDITAR);

  // Modal
  readonly showForm = signal(false);
  readonly editingRole = signal<Role | null>(null);
  readonly saving = signal(false);
  roleForm!: FormGroup;

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    nombre: [{ type: 'required', message: 'El nombre del rol es obligatorio.' }],
  };

  // Confirmación
  readonly confirmVisible = signal(false);
  readonly confirmRole = signal<Role | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();
    this.cargarRecursos();
    this.roleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      permisos: this.fb.array([], minSelectedValidator()),
    });
  }

  /** Acceso al FormArray de permisos desde el template. */
  get permisosArray(): FormArray {
    return this.roleForm.get('permisos') as FormArray;
  }

  /** Carga los recursos de la aplicación y construye los checkboxes. */
  cargarRecursos(): void {
    this.roleService.listarRecursos(this.apliId()).subscribe({
      next: (res) => {
        this.recursos.set(res.data ?? []);
        this.buildPermisosCheckboxes();
      },
      error: () => {},
    });
  }

  /** Construye los controles checkbox del FormArray según los recursos. */
  private buildPermisosCheckboxes(selectedIds: number[] = []): void {
    const array = this.permisosArray;
    array.clear();
    this.recursos().forEach(() => {
      array.push(this.fb.control(false));
    });
    // Marcar los que ya están asignados
    if (selectedIds.length > 0) {
      this.recursos().forEach((r, i) => {
        if (selectedIds.includes(r.id)) {
          array.at(i).setValue(true);
        }
      });
    }
    array.updateValueAndValidity();
  }

  /** Alterna un permiso y actualiza la validez del FormArray. */
  togglePermiso(index: number, checked: boolean): void {
    this.permisosArray.at(index).setValue(checked);
    this.permisosArray.at(index).markAsTouched();
    this.permisosArray.updateValueAndValidity();
  }

  /** Filtra los permisos en tiempo real. */
  filtrarPermisos(term: string): void {
    this.filtroPermisos.set(term);
  }

  /** Selecciona/deselecciona todos los permisos (los visibles si hay filtro). */
  toggleSelectAllPermisos(checked: boolean): void {
    const indices = this.recursosFiltradosIndices();
    indices.forEach((i) => {
      this.permisosArray.at(i).setValue(checked);
    });
    this.permisosArray.updateValueAndValidity();
  }

  /** Estado del checkbox "Seleccionar todos": true, false, o null (parcial). */
  get selectAllPermisosState(): boolean | null {
    const indices = this.recursosFiltradosIndices();
    if (indices.length === 0) return false;
    const values = indices.map((i) => this.permisosArray.at(i).value);
    const allTrue = values.every((v) => v === true);
    const allFalse = values.every((v) => v === false);
    if (allTrue) return true;
    if (allFalse) return false;
    return null; // indeterminado/parcial
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

  /** True si el FormArray de permisos tiene error de minSelected. */
  get permisosInvalid(): boolean {
    return this.permisosArray.hasError('minSelected') && this.permisosArray.touched;
  }

  cargar(): void {
    this.loading.set(true);
    this.roleService.listarRoles(this.apliId()).subscribe({
      next: (res) => { this.roles.set(res.data ?? []); this.filtrar(); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const term = this.searchTerm().toLowerCase();
    this.filteredRoles.set(this.roles().filter((r) => !term || r.nombre.toLowerCase().includes(term) || (r.descripcion ?? '').toLowerCase().includes(term)));
  }

  abrirCrear(): void {
    this.editingRole.set(null);
    this.filtroPermisos.set('');
    this.roleForm?.reset({ nombre: '', descripcion: '' });
    this.buildPermisosCheckboxes([]);
    this.showForm.set(true);
  }

  abrirEditar(role: Role): void {
    this.editingRole.set(role);
    this.filtroPermisos.set('');
    this.roleForm?.patchValue({ nombre: role.nombre, descripcion: role.descripcion ?? '' });
    // Cargar los permisos ya asignados al rol
    this.roleService.obtenerRecursosPorRol(this.apliId(), role.id).subscribe({
      next: (res) => {
        const assignedIds = (res.data ?? []).map((rr) => rr.recuId);
        this.buildPermisosCheckboxes(assignedIds);
      },
      error: () => this.buildPermisosCheckboxes([]),
    });
    this.showForm.set(true);
  }

  cerrarForm(): void { this.showForm.set(false); }

  guardar(): void {
    if (this.roleForm.invalid) return;
    this.saving.set(true);
    const formValue = this.roleForm.getRawValue();
    const role = this.editingRole();
    const selectedIds = this.getSelectedPermisosIds();

    // Regla de inactivación automática: si no hay permisos, el rol queda inactivo
    const shouldDeactivate = selectedIds.length === 0;

    if (role) {
      this.roleService.actualizarRol({
        id: role.id,
        apliId: this.apliId(),
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        estado: shouldDeactivate ? false : undefined,
      }, this.auth.usuarioRed())
        .subscribe({
          next: () => this.syncPermisos(role.id, selectedIds),
          error: () => this.saving.set(false),
        });
    } else {
      this.roleService.crearRol({ apliId: this.apliId(), nombre: formValue.nombre, descripcion: formValue.descripcion }, this.auth.usuarioRed())
        .subscribe({
          next: (res) => {
            const newRoleId = res.data.id;
            this.syncPermisos(newRoleId, selectedIds);
          },
          error: () => this.saving.set(false),
        });
    }
  }

  /** Sincroniza los permisos asignados al rol y finaliza el guardado. */
  private syncPermisos(rolId: number, selectedIds: number[]): void {
    // Primero retirar los que ya no están seleccionados
    const retirarPromises: any[] = [];
    this.roleService.obtenerRecursosPorRol(this.apliId(), rolId).subscribe({
      next: (res) => {
        const currentAssigned = res.data ?? [];
        currentAssigned.forEach((rr) => {
          if (!selectedIds.includes(rr.recuId)) {
            this.roleService.retirarRecursoRol(this.apliId(), rr.recuId, rolId).subscribe();
          }
        });
        // Luego asignar los nuevos que no estaban
        const currentIds = currentAssigned.map((rr) => rr.recuId);
        selectedIds.forEach((recuId) => {
          if (!currentIds.includes(recuId)) {
            this.roleService.asignarRecursoRol(this.apliId(), recuId, rolId).subscribe();
          }
        });
        this.saving.set(false);
        this.showForm.set(false);
        this.cargar();
      },
      error: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.cargar();
      },
    });
  }

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
    if (!role) return;
    this.confirmVisible.set(false);
    this.roleService.actualizarRol({ id: role.id, apliId: this.apliId(), estado: role.estado !== 'ACTIVO' }, this.auth.usuarioRed())
      .subscribe(() => this.cargar());
  }

  // ==================== Modal de Usuarios por Rol ====================

  readonly showUsuariosModal = signal(false);
  readonly rolSeleccionado = signal<Role | null>(null);
  readonly usuariosRol = signal<UserApplication[]>([]);
  readonly usuarioBuscado = signal<User | null>(null);
  readonly buscandoUsuario = signal(false);
  readonly searchUsuarioError = signal('');

  /** Búsqueda interna de usuarios asignados (tiempo real). */
  readonly filtroInterno = signal('');

  /** Usuarios filtrados por la búsqueda interna. */
  readonly usuariosFiltrados = computed(() => {
    const term = this.filtroInterno().toLowerCase().trim();
    if (!term) return this.usuariosRol();
    return this.usuariosRol().filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.usuarioRed.toLowerCase().includes(term) ||
        (u.correo ?? '').toLowerCase().includes(term)
    );
  });

  /** Paginación de la lista de usuarios asignados. */
  readonly currentPageUsuarios = signal(1);
  readonly itemsPerPageUsuarios = 10;
  readonly totalPagesUsuarios = computed(() =>
    Math.ceil(this.usuariosFiltrados().length / this.itemsPerPageUsuarios) || 1
  );
  readonly paginatedUsuarios = computed(() => {
    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios;
    return this.usuariosFiltrados().slice(start, start + this.itemsPerPageUsuarios);
  });

  /** Indicador de rango mostrado. */
  readonly rangoMostrado = computed(() => {
    const total = this.usuariosFiltrados().length;
    if (total === 0) return '0 usuarios';
    const start = (this.currentPageUsuarios() - 1) * this.itemsPerPageUsuarios + 1;
    const end = Math.min(this.currentPageUsuarios() * this.itemsPerPageUsuarios, total);
    return `Mostrando ${start}-${end} de ${total.toLocaleString('es-CO')} usuario(s) asignado(s)`;
  });

  /** Set de índices globales seleccionados (persiste entre páginas). */
  readonly selectedIndices = signal<Set<number>>(new Set());

  /** Formulario de búsqueda de usuario. */
  searchUsuarioForm!: FormGroup;

  /** FormArray de selección de usuarios para desvincular. */
  seleccionForm!: FormGroup;

  /** Inicializa los formularios del modal de usuarios. */
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

  /** Abre el modal de usuarios asociados a un rol. */
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

  /** Carga los usuarios asignados al rol. */
  cargarUsuariosRol(rolId: number): void {
    this.userService.listarPorRol(this.apliId(), rolId).subscribe({
      next: (res) => {
        const usuarios = res.data ?? [];
        this.usuariosRol.set(usuarios);
        this.currentPageUsuarios.set(1);
        this.selectedIndices.set(new Set());
        this.seleccionForm.get('selectAll')?.setValue(false);
      },
      error: () => {},
    });
  }

  /** Filtra la lista de usuarios asignados en tiempo real. */
  filtrarUsuariosAsignados(term: string): void {
    this.filtroInterno.set(term);
    this.currentPageUsuarios.set(1);
  }

  /** Navegación de paginación. */
  onPageChangeUsuarios(page: number): void {
    this.currentPageUsuarios.set(page);
  }

  /** Verifica si un usuario (por índice global) está seleccionado. */
  isUsuarioSelected(globalIndex: number): boolean {
    return this.selectedIndices().has(globalIndex);
  }

  /** Alterna la selección individual de un usuario por índice global. */
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

  /** Alterna "Seleccionar todos" — marca/desmarca solo los de la página actual. */
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

  /** Actualiza el estado del checkbox "Seleccionar todos" según la página actual. */
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

  /** Retorna true si hay al menos un usuario seleccionado. */
  get haySeleccionados(): boolean {
    return this.selectedIndices().size > 0;
  }

  /** Número de usuarios seleccionados. */
  get cantidadSeleccionados(): number {
    return this.selectedIndices().size;
  }

  /** Desvincula los usuarios seleccionados del rol. */
  quitarSeleccionados(): void {
    const role = this.rolSeleccionado();
    if (!role) return;
    const usuarios = this.usuariosFiltrados();
    const indices = Array.from(this.selectedIndices()).sort((a, b) => a - b);
    const usuariosAQuitar = indices
      .map((i) => usuarios[i])
      .filter((u): u is UserApplication => !!u);

    let pendientes = usuariosAQuitar.length;
    if (pendientes === 0) return;

    usuariosAQuitar.forEach((u) => {
      this.userService.desasignarRol(u.usuarioRed, this.apliId(), role.id).subscribe({
        next: () => {
          pendientes--;
          if (pendientes === 0) {
            this.cargarUsuariosRol(role.id);
          }
        },
        error: () => { pendientes--; },
      });
    });
  }

  /** Busca un usuario por usuarioRed para asociarlo al rol. */
  buscarUsuarioRol(): void {
    const usuarioRed = this.searchUsuarioForm.get('usuarioRed')?.value?.trim();
    if (!usuarioRed || this.searchUsuarioForm.get('usuarioRed')?.invalid) {
      this.searchUsuarioError.set('Ingrese un usuario de red válido (mínimo 2 caracteres).');
      return;
    }
    this.buscandoUsuario.set(true);
    this.searchUsuarioError.set('');
    this.userService.buscarPorUsuarioRed(usuarioRed).subscribe({
      next: (res) => {
        this.buscandoUsuario.set(false);
        const user = res.data;
        if (user) {
          const yaAsignado = this.usuariosRol().some((u) => u.usuarioRed === user.usuarioRed);
          if (yaAsignado) {
            this.searchUsuarioError.set(`El usuario "${user.usuarioRed}" ya está asignado a este rol.`);
            this.usuarioBuscado.set(null);
          } else {
            this.usuarioBuscado.set(user);
          }
        } else {
          this.usuarioBuscado.set(null);
          this.searchUsuarioError.set(`No se encontró ningún usuario con usuarioRed "${usuarioRed}".`);
        }
      },
      error: () => {
        this.buscandoUsuario.set(false);
        this.searchUsuarioError.set('Error al buscar el usuario.');
      },
    });
  }

  /** Asocia el usuario buscado al rol actual. */
  asociarUsuarioRol(): void {
    const user = this.usuarioBuscado();
    const role = this.rolSeleccionado();
    if (!user || !role) return;
    this.userService.asignarRol({
      usuarioRed: user.usuarioRed,
      apliId: this.apliId(),
      rolId: role.id,
      fechaIn: new Date().toISOString().substring(0, 10),
    }).subscribe({
      next: () => {
        this.usuarioBuscado.set(null);
        this.searchUsuarioForm.reset({ usuarioRed: '' });
        this.cargarUsuariosRol(role.id);
      },
      error: () => {},
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
  }
}
