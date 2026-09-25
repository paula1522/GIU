import { Component, inject, signal, computed, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
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
import { HeaderPagesComponent, HeaderButton } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';

interface RegistroMasivo {
  nombreCompleto: string;
  identificacion: string;
  usuarioRed: string;
  idRol: string;
}

/** Registro de eliminación masiva: solo usuario de red. La validación se aplica a nivel de base de datos. */
interface RegistroEliminacion {
  usuarioRed: string;
}

interface ErrorValidacion {
  fila: number;
  mensaje: string;
}

/** Tipo de flujo dentro del modal de carga masiva. */
type FlujoCargaMasiva = 'creacion' | 'eliminacion';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, SelectComponent, ButtonComponent, CheckboxComponent, HeaderPagesComponent, ModalComponent, ConfirmModalComponent],
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
      btns.push({
        text: 'Carga masiva',
        icon: 'bi bi-file-earmark-spreadsheet',
        class: ['btn', 'btn-primary-secondary'],
        type: 'button',
        action: 'CARGA_MASIVA',
      });
    }
    return btns;
  });

  /** Maneja los eventos de botones del header-pages. */
  onHeaderButtonClick(action: string): void {
    if (action === 'NUEVO') {
      this.abrirCrear();
    } else if (action === 'CARGA_MASIVA') {
      this.abrirCargaMasiva();
    }
  }
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.USUARIOS_EDITAR);
  readonly canToggle = this.auth.hasPermission(PERMISSIONS.USUARIOS_GESTIONAR_ESTADO);

  // ---------- Modal crear/editar ----------
  @ViewChild('userModal') userModal!: ModalComponent;
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly editingUser = signal<UserApplication | null>(null);

  /** Fase del modal: 'search' = buscar usuarioRed, 'form' = formulario completo */
  readonly formPhase = signal<'search' | 'form'>('search');

  /** Título dinámico del modal según edición/creación. */
  readonly modalTitle = computed(() => this.editingUser() ? 'Editar usuario' : 'Nuevo usuario');

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
    this.userModal?.open();
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
    this.userModal?.open();
  }

  cerrarForm(): void {
    this.showForm.set(false);
    this.formPhase.set('search');
    this.foundUser.set(null);
    this.searchError.set('');
    this.userModal?.close();
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
          this.cerrarForm();
          this.cargar();
        },
        error: () => this.saving.set(false),
      });
    } else {
      this.userService.crear(baseRequest, this.auth.usuarioRed()).subscribe({
        next: () => {
          this.saving.set(false);
          this.cerrarForm();
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

  // ==================== Carga Masiva ====================

  @ViewChild('cargaModal') cargaModal!: ModalComponent;
  readonly showCargaMasiva = signal(false);
  readonly archivoCargado = signal<File | null>(null);
  readonly registrosMasivos = signal<RegistroMasivo[]>([]);
  readonly erroresValidacion = signal<ErrorValidacion[]>([]);
  readonly procesandoCarga = signal(false);
  readonly cargaExitosa = signal(false);
  readonly cargaErrorMsg = signal('');
  readonly showConfirmCarga = signal(false);

  /** Tipo de flujo activo en el modal de carga masiva. */
  readonly flujoCarga = signal<FlujoCargaMasiva>('creacion');

  /** Registros de eliminación masiva con estado de validación. */
  readonly registrosEliminacion = signal<RegistroEliminacion[]>([]);
  readonly procesandoEliminacion = signal(false);
  readonly eliminacionExitosa = signal(false);
  readonly eliminacionErrorMsg = signal('');
  readonly showConfirmEliminacion = signal(false);

  /** Encabezado requerido para el flujo de eliminación. */
  private readonly HEADER_ELIMINACION = ['usuario de red'];

  /** Título dinámico del modal de carga masiva según flujo. */
  readonly cargaModalTitle = computed(() =>
    this.flujoCarga() === 'eliminacion'
      ? 'Eliminación / Desvinculación masiva'
      : 'Carga masiva de usuarios'
  );

  /** Encabezados requeridos en el Excel. */
  private readonly HEADERS_REQUERIDOS = ['Nombre completo', 'identificacion', 'usuario de red', 'id del rol'];

  /** Abrir modal de carga masiva. */
  abrirCargaMasiva(): void {
    this.showCargaMasiva.set(true);
    this.limpiarCarga();
    this.cargaModal?.open();
  }

  /** Cerrar modal de carga masiva. */
  cerrarCargaMasiva(): void {
    this.showCargaMasiva.set(false);
    this.limpiarCarga();
    this.cargaModal?.close();
  }

  /** Limpiar estado de carga. */
  limpiarCarga(): void {
    this.archivoCargado.set(null);
    this.registrosMasivos.set([]);
    this.erroresValidacion.set([]);
    this.procesandoCarga.set(false);
    this.cargaExitosa.set(false);
    this.cargaErrorMsg.set('');
    // Limpieza del flujo de eliminación
    this.registrosEliminacion.set([]);
    this.procesandoEliminacion.set(false);
    this.eliminacionExitosa.set(false);
    this.eliminacionErrorMsg.set('');
  }

  /** Cambia el flujo activo dentro del modal de carga masiva. */
  cambiarFlujoCarga(flujoo: FlujoCargaMasiva): void {
    this.limpiarCarga();
    this.flujoCarga.set(flujoo);
  }

  /** Maneja la selección de archivo. */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  /** Maneja el arrastre de archivo (drag & drop). */
  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  /** Previene el comportamiento por defecto del drag over. */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** Procesa el archivo Excel: valida extensión, lee y valida datos. */
  private procesarArchivo(file: File): void {
    this.limpiarCarga();
    this.cargaErrorMsg.set('');

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx') {
      this.cargaErrorMsg.set('Solo se permiten archivos con extensión .xlsx');
      return;
    }

    // Validar tipo MIME
    const mimeValido = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.type === 'application/vnd.ms-excel' || file.type === '';
    if (!mimeValido) {
      this.cargaErrorMsg.set('El tipo de archivo no es válido. Solo se aceptan archivos Excel (.xlsx).');
      return;
    }

    this.archivoCargado.set(file);

    // Leer el archivo Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];

        if (this.flujoCarga() === 'eliminacion') {
          this.validarEstructuraEliminacion(jsonData);
        } else {
          this.validarEstructuraYDatos(jsonData);
        }
      } catch (error) {
        this.cargaErrorMsg.set('Error al leer el archivo Excel. Verifique que el archivo no esté corrupto.');
      }
    };
    reader.onerror = () => {
      this.cargaErrorMsg.set('Error al cargar el archivo.');
    };
    reader.readAsArrayBuffer(file);
  }

  /** Valida la estructura de encabezados y los datos de cada fila. */
  private validarEstructuraYDatos(data: any[][]): void {
    const errores: ErrorValidacion[] = [];
    const registros: RegistroMasivo[] = [];

    if (data.length === 0) {
      this.cargaErrorMsg.set('El archivo está vacío.');
      return;
    }

    // Validar encabezados (fila 0)
    const headers = data[0].map((h: any) => String(h).trim());
    const headersFaltantes = this.HEADERS_REQUERIDOS.filter(h => !headers.includes(h));
    if (headersFaltantes.length > 0) {
      this.cargaErrorMsg.set(`Faltan encabezados requeridos: ${headersFaltantes.join(', ')}. Encabezados esperados: ${this.HEADERS_REQUERIDOS.join(', ')}`);
      return;
    }

    // Mapear índices de columnas
    const idxNombre = headers.indexOf('Nombre completo');
    const idxIdent = headers.indexOf('identificacion');
    const idxUsuario = headers.indexOf('usuario de red');
    const idxRol = headers.indexOf('id del rol');

    // Set para detectar duplicados
    const identificacionesVistas = new Set<string>();
    const usuariosRedVistos = new Set<string>();

    // Procesar filas (desde la fila 1, la 0 es encabezado)
    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const numFila = i + 1; // +1 porque la fila 1 es encabezado en Excel

      // Saltar filas completamente vacías
      if (fila.every(c => c === '' || c === null || c === undefined)) continue;

      const nombreCompleto = String(fila[idxNombre] ?? '').trim();
      const identificacion = String(fila[idxIdent] ?? '').trim();
      const usuarioRed = String(fila[idxUsuario] ?? '').trim();
      const idRol = String(fila[idxRol] ?? '').trim();

      // Validar campos obligatorios
      if (!nombreCompleto) {
        errores.push({ fila: numFila, mensaje: "El campo 'Nombre completo' es obligatorio." });
      }
      if (!identificacion) {
        errores.push({ fila: numFila, mensaje: "El campo 'identificacion' es obligatorio." });
      }
      if (!usuarioRed) {
        errores.push({ fila: numFila, mensaje: "El campo 'usuario de red' es obligatorio." });
      }
      if (!idRol) {
        errores.push({ fila: numFila, mensaje: "El campo 'id del rol' es obligatorio." });
      }

      // Validar formato numérico
      if (identificacion && !/^\d+$/.test(identificacion)) {
        errores.push({ fila: numFila, mensaje: `El campo 'identificacion' debe ser numérico. Valor encontrado: "${identificacion}"` });
      }
      if (idRol && !/^\d+$/.test(idRol)) {
        errores.push({ fila: numFila, mensaje: `El campo 'id del rol' debe ser numérico. Valor encontrado: "${idRol}"` });
      }

      // Validar duplicados internos
      if (identificacion) {
        if (identificacionesVistas.has(identificacion)) {
          errores.push({ fila: numFila, mensaje: `Identificación duplicada: "${identificacion}" ya existe en el archivo.` });
        } else {
          identificacionesVistas.add(identificacion);
        }
      }
      if (usuarioRed) {
        if (usuariosRedVistos.has(usuarioRed.toLowerCase())) {
          errores.push({ fila: numFila, mensaje: `Usuario de red duplicado: "${usuarioRed}" ya existe en el archivo.` });
        } else {
          usuariosRedVistos.add(usuarioRed.toLowerCase());
        }
      }

      // Si no hay errores en esta fila, agregar a registros válidos
      const erroresFila = errores.filter(e => e.fila === numFila);
      if (erroresFila.length === 0) {
        registros.push({ nombreCompleto, identificacion, usuarioRed, idRol });
      }
    }

    this.registrosMasivos.set(registros);
    this.erroresValidacion.set(errores);
  }

  /**
   * Valida la estructura del archivo de eliminación masiva.
   * Encabezado único: "usuario de red".
   * Validaciones: celdas vacías, duplicados internos.
   * Luego verifica contra el servicio mock el estado de cada usuario.
   */
  private validarEstructuraEliminacion(data: any[][]): void {
    const errores: ErrorValidacion[] = [];
    const usuariosRed: string[] = [];

    if (data.length === 0) {
      this.cargaErrorMsg.set('El archivo está vacío.');
      return;
    }

    // Validar encabezado (fila 0)
    const headers = data[0].map((h: any) => String(h).trim().toLowerCase());
    const headerEsperado = this.HEADER_ELIMINACION[0].toLowerCase();
    if (!headers.includes(headerEsperado)) {
      this.cargaErrorMsg.set(
        `Encabezado inválido. Se esperaba "${this.HEADER_ELIMINACION[0]}", se encontró: "${headers.join(', ')}".`
      );
      return;
    }

    const idxUsuario = headers.indexOf(headerEsperado);
    const usuariosVistos = new Set<string>();

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const numFila = i + 1;

      // Saltar filas completamente vacías
      if (fila.every(c => c === '' || c === null || c === undefined)) continue;

      const usuarioRed = String(fila[idxUsuario] ?? '').trim();

      if (!usuarioRed) {
        errores.push({ fila: numFila, mensaje: "El campo 'usuario de red' es obligatorio." });
        continue;
      }

      // Validar que el registro sea numérico
      if (!/^\d+$/.test(usuarioRed)) {
        errores.push({
          fila: numFila,
          mensaje: `El registro "${usuarioRed}" no es numérico. El campo 'usuario de red' debe contener solo dígitos.`,
        });
        continue;
      }

      if (usuariosVistos.has(usuarioRed.toLowerCase())) {
        errores.push({ fila: numFila, mensaje: `Usuario de red duplicado: "${usuarioRed}" ya existe en el archivo.` });
      } else {
        usuariosVistos.add(usuarioRed.toLowerCase());
        usuariosRed.push(usuarioRed);
      }
    }

    this.erroresValidacion.set(errores);

    if (usuariosRed.length === 0 && errores.length === 0) {
      this.cargaErrorMsg.set('El archivo no contiene registros para procesar.');
      return;
    }

    // Los usuarios se almacenan sin validación a nivel front; la lógica se aplica en base de datos.
    this.registrosEliminacion.set(usuariosRed.map((u) => ({ usuarioRed: u })));
  }

  /** Tamaño del archivo formateado. */
  get tamanoArchivo(): string {
    const file = this.archivoCargado();
    if (!file) return '';
    const kb = file.size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  /** True si hay registros válidos y no hay errores. */
  get puedeProcesar(): boolean {
    return this.registrosMasivos().length > 0 && this.erroresValidacion().length === 0 && !this.procesandoCarga();
  }

  /** Cantidad total de usuarios cargados para eliminación. */
  get usuariosValidosEliminacion(): number {
    return this.registrosEliminacion().length;
  }

  /** True si hay usuarios para eliminar y no se está procesando. */
  get puedeProcesarEliminacion(): boolean {
    return this.usuariosValidosEliminacion > 0 && this.erroresValidacion().length === 0 && !this.procesandoEliminacion();
  }

  /** Errores de validación cuyo mensaje indica que el registro no es numérico. */
  get erroresNoNumericos(): ErrorValidacion[] {
    return this.erroresValidacion().filter((e) => e.mensaje.includes('no es numérico'));
  }

  /** Cantidad de registros que no son numéricos. */
  get cantidadNoNumericos(): number {
    return this.erroresNoNumericos.length;
  }

  /** Lista de números de fila con registros no numéricos, separados por coma. */
  get filasNoNumericas(): string {
    return this.erroresNoNumericos.map((e) => e.fila).join(', ');
  }

  /** Abre la confirmación de carga masiva. */
  confirmarCargaMasiva(): void {
    this.showConfirmCarga.set(true);
  }

  /** Procesa la carga masiva: crea los usuarios en el sistema. */
  ejecutarCargaMasiva(): void {
    this.showConfirmCarga.set(false);
    this.procesandoCarga.set(true);
    this.cargaExitosa.set(false);
    this.cargaErrorMsg.set('');

    const registros = this.registrosMasivos();
    let pendientes = registros.length;
    let exitosos = 0;
    let fallidos = 0;
    const erroresBackend: string[] = [];

    registros.forEach((reg) => {
      this.userService.crear({
        usuarioRed: reg.usuarioRed,
        nombre: reg.nombreCompleto,
        correo: `${reg.usuarioRed}@claro.com.co`,
        numeroIdentificacion: reg.identificacion,
      }, this.auth.usuarioRed()).subscribe({
        next: () => {
          exitosos++;
          pendientes--;
          if (pendientes === 0) this.finalizarCarga(exitosos, fallidos, erroresBackend);
        },
        error: () => {
          fallidos++;
          erroresBackend.push(`Error al crear usuario "${reg.usuarioRed}"`);
          pendientes--;
          if (pendientes === 0) this.finalizarCarga(exitosos, fallidos, erroresBackend);
        },
      });
    });
  }

  /** Finaliza la carga masiva y muestra el resultado. */
  private finalizarCarga(exitosos: number, fallidos: number, errores: string[]): void {
    this.procesandoCarga.set(false);
    if (fallidos === 0) {
      this.cargaExitosa.set(true);
    } else {
      this.cargaErrorMsg.set(`Carga finalizada: ${exitosos} usuario(s) creado(s) correctamente, ${fallidos} fallido(s). ${errores.join('; ')}`);
    }
    this.cargar();
  }

  // ==================== Eliminación / Desvinculación Masiva ====================

  /** Abre la confirmación de eliminación masiva. */
  confirmarEliminacionMasiva(): void {
    this.showConfirmEliminacion.set(true);
  }

  /**
   * Procesa la eliminación/desvinculación masiva.
   * Recorre los registros válidos y desasigna el rol de cada usuario.
   * Si el usuario queda sin roles, se inactiva automáticamente.
   */
  ejecutarEliminacionMasiva(): void {
    this.showConfirmEliminacion.set(false);
    this.procesandoEliminacion.set(true);
    this.eliminacionExitosa.set(false);
    this.eliminacionErrorMsg.set('');

    const registros = this.registrosEliminacion();
    let pendientes = registros.length;
    let exitosos = 0;
    let fallidos = 0;
    const erroresBackend: string[] = [];

    if (pendientes === 0) {
      this.procesandoEliminacion.set(false);
      this.eliminacionErrorMsg.set('No hay usuarios para procesar.');
      return;
    }

    registros.forEach((reg) => {
      // Desasignar el rol del usuario (usar gestión de estado para inactivar si es el único rol)
      this.userService.gestionarEstado(reg.usuarioRed, false).subscribe({
        next: () => {
          exitosos++;
          pendientes--;
          if (pendientes === 0) this.finalizarEliminacion(exitosos, fallidos, erroresBackend);
        },
        error: () => {
          fallidos++;
          erroresBackend.push(`Error al desvincular usuario "${reg.usuarioRed}"`);
          pendientes--;
          if (pendientes === 0) this.finalizarEliminacion(exitosos, fallidos, erroresBackend);
        },
      });
    });
  }

  /** Finaliza la eliminación masiva y muestra el resultado. */
  private finalizarEliminacion(exitosos: number, fallidos: number, errores: string[]): void {
    this.procesandoEliminacion.set(false);
    if (fallidos === 0) {
      this.eliminacionExitosa.set(true);
    } else {
      this.eliminacionErrorMsg.set(
        `Eliminación finalizada: ${exitosos} usuario(s) desvinculado(s) correctamente, ${fallidos} fallido(s). ${errores.join('; ')}`
      );
    }
    this.cargar();
  }
}
