import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserMockService } from '../../../services/mock/user-mock.service';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { UserApplication, Perfil, Role } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { CheckboxComponent } from '../../../shared/atomic-desing/atoms/checkbox/checkbox.component';
import { HeaderPagesComponent, HeaderButton } from '../../../shared/molecule/header-pages/header-pages.component';
import { ConfirmModalComponent } from '../../../shared/molecule/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, SelectComponent, ButtonComponent, CheckboxComponent, HeaderPagesComponent, ConfirmModalComponent],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserMockService);
  private readonly roleService = inject(RoleMockService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly usuarios = signal<UserApplication[]>([]);
  readonly searchTerm = signal('');
  readonly filteredUsers = signal<UserApplication[]>([]);
  readonly apliId = signal(0);

  // Listas de catálogos
  readonly perfiles = signal<Perfil[]>([]);
  readonly roles = signal<Role[]>([]);

  // Opciones formateadas para el átomo de Select
  readonly perfilOptions = computed(() =>
    this.perfiles().map((p) => ({ id: p.id, nameSelect: `${p.nombre} — ${p.descripcion ?? ''}` }))
  );
  readonly rolOptions = computed(() =>
    this.roles().map((r) => ({ id: r.id, nameSelect: r.nombre }))
  );

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Usuario', 'Nombre', 'Correo', 'Perfil', 'Estado', 'Rol', 'Admin', 'Acciones'];
  readonly columnsToDisplay = ['usuarioRed', 'nombre', 'correo', 'perfilNombre', 'estado', 'nombreRol', 'esAdmin', 'acciones'];

  /** Transforma los usuarios filtrados al formato ColumnConfig[] que espera el átomo de tabla. */
  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredUsers().map((u) => this.buildRow(u));
  });

  private buildRow(u: UserApplication): ColumnConfig {
    const esAdmin = (u.esAdministrador ?? u.superAdministrador) === 1;
    const buttons: ActionButton[] = [];
    if (this.canEdit) {
      buttons.push({
        label: 'Editar',
        action: 'EDITAR',
        title: 'Editar usuario',
        icon: 'bi bi-pencil-square',
        styles: 'btn-table-edit',
        type: 'button',
      });
    }
    if (this.canToggle) {
      buttons.push({
        label: u.estado === 'ACTIVO' ? 'Inactivar' : 'Activar',
        action: 'TOGGLE',
        title: u.estado === 'ACTIVO' ? 'Inactivar usuario' : 'Activar usuario',
        icon: u.estado === 'ACTIVO' ? 'bi bi-toggle-on' : 'bi bi-toggle-off',
        styles: u.estado === 'ACTIVO' ? 'btn-table-danger' : 'btn-table-success',
        type: 'button',
      });
    }

    return {
      _user: u,
      usuarioRed: { typeColum: typeColum.string, columValue: u.usuarioRed },
      nombre: { typeColum: typeColum.string, columValue: u.nombre },
      correo: { typeColum: typeColum.string, columValue: u.correo || '—' },
      perfilNombre: { typeColum: typeColum.string, columValue: u.perfilNombre || '—' },
      estado: { typeColum: typeColum.status, columValue: u.estado, satusValue: u.estado === 'ACTIVO' },
      nombreRol: { typeColum: typeColum.string, columValue: u.nombreRol || '—' },
      esAdmin: { typeColum: typeColum.string, columValue: esAdmin ? 'Sí' : 'No' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  /** Maneja los eventos de acción emitidos por el átomo de tabla. */
  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const user: UserApplication = event.row._user;
    if (event.action === 'EDITAR') {
      this.abrirEditar(user);
    } else if (event.action === 'TOGGLE') {
      this.confirmarToggle(user);
    }
  }

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.USUARIOS_CREAR);

  /** Botones dinámicos para el header-pages. */
  readonly headerButtons = computed<HeaderButton[]>(() => {
    const btns: HeaderButton[] = [];
    if (this.canCreate) {
      btns.push({
        text: 'Nuevo usuario',
        icon: 'bi bi-person-plus',
        class: ['btn', 'btn-primary'],
        type: 'button',
        action: 'NUEVO',
      });
    }
    return btns;
  });

  /** Maneja los eventos de botones del header-pages. */
  onHeaderButtonClick(action: string): void {
    if (action === 'NUEVO') {
      this.abrirCrear();
    }
  }
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.USUARIOS_EDITAR);
  readonly canToggle = this.auth.hasPermission(PERMISSIONS.USUARIOS_GESTIONAR_ESTADO);

  // ---------- Modal crear/editar ----------
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly editingUser = signal<UserApplication | null>(null);

  /** Fase del modal: 'search' = buscar usuarioRed, 'form' = formulario completo */
  readonly formPhase = signal<'search' | 'form'>('search');

  /** Usuario encontrado en la búsqueda */
  readonly foundUser = signal<UserApplication | null>(null);
  readonly searching = signal(false);
  readonly searchError = signal('');

  /** Formulario reactivo de búsqueda */
  searchForm!: FormGroup;

  /** Formulario reactivo de creación/edición */
  userForm!: FormGroup;

  /** Mensajes de validación para el átomo de Input — formulario de búsqueda */
  readonly searchValidationMessages: Record<string, { type: string; message: string }[]> = {
    usuarioRed: [
      { type: 'required', message: 'El usuario de red es obligatorio.' },
      { type: 'minlength', message: 'Ingrese al menos 2 caracteres.' },
    ],
  };

  /** Mensajes de validación para el átomo de Input — formulario de usuario */
  readonly userValidationMessages: Record<string, { type: string; message: string }[]> = {
    usuarioRed: [{ type: 'required', message: 'El usuario de red es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre completo es obligatorio.' }],
    correo: [
      { type: 'required', message: 'El correo electrónico es obligatorio.' },
      { type: 'email', message: 'Ingrese un correo electrónico válido.' },
    ],
    numeroIdentificacion: [{ type: 'required', message: 'La identificación es obligatoria.' }],
    perfilId: [{ type: 'required', message: 'Debe seleccionar un perfil.' }],
  };

  // Modal confirmación
  readonly confirmVisible = signal(false);
  readonly confirmUser = signal<UserApplication | null>(null);
  readonly confirmTitle = signal('');
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();
    this.cargarCatalogos();

    this.searchForm = this.fb.group({
      usuarioRed: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.userForm = this.fb.group({
      usuarioRed: [{ value: '', disabled: true }, [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      numeroIdentificacion: ['', [Validators.required, Validators.maxLength(20)]],
      perfilId: [null, [Validators.required]],
      esAdministrador: [false],
      rolId: [null],
      fechaInRol: [''],
      fechaFinRol: [''],
    });
  }

  ngOnDestroy(): void {}

  cargarCatalogos(): void {
    this.userService.listarPerfiles().subscribe({
      next: (res) => this.perfiles.set(res.data ?? []),
      error: () => {},
    });
    this.roleService.listarRoles(this.apliId()).subscribe({
      next: (res) => this.roles.set(res.data ?? []),
      error: () => {},
    });
  }

  cargar(): void {
    this.loading.set(true);
    this.userService.listarPorAplicacion(this.apliId()).subscribe({
      next: (res) => {
        this.usuarios.set(res.data ?? []);
        this.filtrar();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const term = this.searchTerm().toLowerCase();
    this.filteredUsers.set(
      this.usuarios().filter(
        (u) => !term || u.usuarioRed.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term) || (u.correo ?? '').toLowerCase().includes(term)
      )
    );
  }

  // ---------- Apertura del modal ----------

  abrirCrear(): void {
    this.editingUser.set(null);
    this.foundUser.set(null);
    this.searchError.set('');
    this.formPhase.set('search');
    this.searchForm.reset();
    this.userForm.reset();
    this.showForm.set(true);
  }

  abrirEditar(user: UserApplication): void {
    this.editingUser.set(user);
    this.foundUser.set(user);
    this.formPhase.set('form');
    this.searchError.set('');
    this.showForm.set(true);

    this.userForm.patchValue({
      usuarioRed: user.usuarioRed,
      nombre: user.nombre,
      correo: user.correo ?? '',
      numeroIdentificacion: user.numeroIdentificacion ?? '',
      perfilId: user.perfilId ?? null,
      esAdministrador: (user.esAdministrador ?? user.superAdministrador) === 1,
      rolId: user.idRol ?? null,
      fechaInRol: user.fechaInRol ? user.fechaInRol.substring(0, 10) : '',
      fechaFinRol: user.fechaFinRol ? user.fechaFinRol.substring(0, 10) : '',
    });
  }

  cerrarForm(): void {
    this.showForm.set(false);
    this.formPhase.set('search');
    this.foundUser.set(null);
    this.searchError.set('');
  }

  // ---------- Búsqueda por usuarioRed ----------

  buscarUsuario(): void {
    const usuarioRed = this.searchForm.get('usuarioRed')?.value?.trim();
    if (!usuarioRed || this.searchForm.get('usuarioRed')?.invalid) {
      this.searchError.set('Ingrese un usuario de red válido (mínimo 2 caracteres).');
      return;
    }
    this.searching.set(true);
    this.searchError.set('');
    this.userService.buscarPorUsuarioRed(usuarioRed).subscribe({
      next: (res) => {
        this.searching.set(false);
        const user = res.data;
        if (user) {
          // Usuario existe → cargar datos en el formulario para edición
          this.foundUser.set(user as UserApplication);
          this.formPhase.set('form');
          this.userForm.patchValue({
            usuarioRed: user.usuarioRed,
            nombre: user.nombre,
            correo: user.correo ?? '',
            numeroIdentificacion: user.numeroIdentificacion ?? '',
            perfilId: user.perfilId ?? null,
            esAdministrador: (user.esAdministrador ?? user.superAdministrador) === 1,
          });
        } else {
          // Usuario no existe → habilitar formulario para creación
          this.foundUser.set(null);
          this.formPhase.set('form');
          this.userForm.patchValue({
            usuarioRed: usuarioRed,
            nombre: '',
            correo: '',
            numeroIdentificacion: '',
            perfilId: null,
            esAdministrador: false,
            rolId: null,
            fechaInRol: '',
            fechaFinRol: '',
          });
        }
      },
      error: () => {
        this.searching.set(false);
        this.searchError.set('Error al buscar el usuario.');
      },
    });
  }

  // ---------- Guardar ----------

  /** El botón Guardar solo se habilita si hay un perfil seleccionado. */
  canSave(): boolean {
    return this.userForm?.get('perfilId')?.value !== null && this.userForm?.valid && !this.saving();
  }

  guardar(): void {
    if (this.userForm.invalid) return;
    const perfilId = this.userForm.get('perfilId')?.value;
    if (!perfilId) return;

    this.saving.set(true);
    const formValue = this.userForm.getRawValue();
    const editing = this.editingUser() ?? this.foundUser();

    const baseRequest = {
      usuarioRed: formValue.usuarioRed,
      nombre: formValue.nombre,
      correo: formValue.correo,
      numeroIdentificacion: formValue.numeroIdentificacion,
      perfilId: formValue.perfilId,
      esAdministrador: formValue.esAdministrador,
      superAdministrador: formValue.esAdministrador,
    };

    if (editing) {
      this.userService.actualizar(baseRequest, this.auth.usuarioRed()).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.cargar();
        },
        error: () => this.saving.set(false),
      });
    } else {
      this.userService.crear(baseRequest, this.auth.usuarioRed()).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.cargar();
        },
        error: () => this.saving.set(false),
      });
    }
  }

  // ---------- Confirmación toggle ----------

  confirmarToggle(user: UserApplication): void {
    this.confirmUser.set(user);
    this.confirmTitle.set(user.estado === 'ACTIVO' ? 'Inactivar usuario' : 'Activar usuario');
    this.confirmMsg.set(
      user.estado === 'ACTIVO'
        ? `¿Desea inactivar el usuario "${user.nombre}" (${user.usuarioRed})? El usuario no podrá iniciar sesión hasta ser activado nuevamente.`
        : `¿Desea activar el usuario "${user.nombre}" (${user.usuarioRed})?`
    );
    this.confirmVisible.set(true);
  }

  ejecutarToggle(): void {
    const user = this.confirmUser();
    if (!user) return;
    this.confirmVisible.set(false);
    this.userService.gestionarEstado(user.usuarioRed, user.estado !== 'ACTIVO').subscribe(() => this.cargar());
  }

  // ---------- Helpers de validación para el átomo de Input ----------

  /** Retorna true si el control del userForm tiene error y está touched/dirty. */
  isInvalid(controlName: string): boolean {
    const c = this.userForm?.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Retorna true si el control del searchForm tiene error y está touched/dirty. */
  isSearchInvalid(controlName: string): boolean {
    const c = this.searchForm?.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Retorna el mensaje de error según el tipo de validación fallida. */
  getErrorMessage(controlName: string): string {
    const c = this.userForm?.get(controlName);
    if (!c || !c.errors) return '';
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('email')) return 'Ingrese un correo electrónico válido.';
    if (c.hasError('minlength')) return `Mínimo ${c.getError('minlength').requiredLength} caracteres.`;
    if (c.hasError('maxlength')) return `Máximo ${c.getError('maxlength').requiredLength} caracteres.`;
    return 'Valor inválido.';
  }

  /** Retorna el mensaje de error para el formulario de búsqueda. */
  getSearchErrorMessage(controlName: string): string {
    const c = this.searchForm?.get(controlName);
    if (!c || !c.errors) return '';
    if (c.hasError('required')) return 'El usuario de red es obligatorio.';
    if (c.hasError('minlength')) return `Mínimo ${c.getError('minlength').requiredLength} caracteres.`;
    return 'Valor inválido.';
  }

  /** Limpia el valor de un control del formulario de búsqueda. */
  clearSearchField(): void {
    this.searchForm?.get('usuarioRed')?.setValue('');
    this.searchError.set('');
  }

  // ---------- Getters para FormControl del átomo de Select ----------
  get perfilControl(): FormControl { return this.userForm.get('perfilId') as FormControl; }
  get rolControl(): FormControl { return this.userForm.get('rolId') as FormControl; }
}
