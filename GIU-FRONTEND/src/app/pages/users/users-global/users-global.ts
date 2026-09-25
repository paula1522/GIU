import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { UserMockService } from '../../../services/mock/user-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { User, UserApplication } from '../../../models/domain/giu.models';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { SelectComponent } from '../../../shared/atomic-desing/atoms/select/select.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-users-global',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, SelectComponent, ButtonComponent, ConfirmModalComponent, HeaderPagesComponent],
  templateUrl: './users-global.html',
  styleUrl: './users-global.scss',
})
export class UsersGlobal implements OnInit {
  private readonly userService = inject(UserMockService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly usuarios = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);

  // Formulario reactivo de filtros
  filtrosForm!: FormGroup;

  // Opciones para los selects
  readonly estadoOptions = [
    { id: '', nameSelect: 'Todos los estados' },
    { id: 'ACTIVO', nameSelect: 'Activo' },
    { id: 'INACTIVO', nameSelect: 'Inactivo' },
    { id: 'BLOQUEADO', nameSelect: 'Bloqueado' },
  ];
  readonly superAdminOptions = [
    { id: '', nameSelect: 'Todos' },
    { id: 'SI', nameSelect: 'Super Admin: Sí' },
    { id: 'NO', nameSelect: 'Super Admin: No' },
  ];

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Usuario Red', 'Nombre', 'Correo', 'Identificación', 'Estado', 'Super Admin', 'Acciones'];
  readonly columnsToDisplay = ['usuarioRed', 'nombre', 'correo', 'numeroIdentificacion', 'estado', 'superAdmin', 'acciones'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredUsers().map((u) => this.buildRow(u));
  });

  private buildRow(u: User): ColumnConfig {
    const buttons: ActionButton[] = [
      { label: 'Detalles', action: 'DETALLES', title: 'Ver detalle del usuario', icon: 'bi bi-info-circle', styles: 'btn-table-view', type: 'button' },
    ];
    return {
      _user: u,
      usuarioRed: { typeColum: typeColum.string, columValue: u.usuarioRed },
      nombre: { typeColum: typeColum.string, columValue: u.nombre },
      correo: { typeColum: typeColum.string, columValue: u.correo || '—' },
      numeroIdentificacion: { typeColum: typeColum.string, columValue: u.numeroIdentificacion },
      estado: { typeColum: typeColum.status, columValue: u.estado, satusValue: u.estado === 'ACTIVO' },
      superAdmin: { typeColum: typeColum.switch, switchValue: u.superAdministrador === 1, switchAction: 'TOGGLE_SUPER_ADMIN' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const user: User = event.row._user;
    if (event.action === 'DETALLES') {
      this.abrirDetalle(user);
    } else if (event.action === 'TOGGLE_SUPER_ADMIN') {
      this.confirmarToggleSuperAdmin(user);
    }
  }

  // ---------- Confirmación toggle super admin ----------
  readonly confirmVisible = signal(false);
  readonly confirmUser = signal<User | null>(null);
  readonly confirmMsg = signal('');
  readonly pendingSwitchValue = signal(false);

  confirmarToggleSuperAdmin(user: User): void {
    this.confirmUser.set(user);
    this.pendingSwitchValue.set(user.superAdministrador !== 1);
    this.confirmMsg.set(
      this.pendingSwitchValue()
        ? `¿Desea conceder privilegios de Super Administrador a "${user.nombre}" (${user.usuarioRed})?`
        : `¿Desea revocar los privilegios de Super Administrador a "${user.nombre}" (${user.usuarioRed})?`
    );
    this.confirmVisible.set(true);
  }

  ejecutarToggleSuperAdmin(): void {
    const user = this.confirmUser();
    if (!user) return;
    this.confirmVisible.set(false);
    const newValue = this.pendingSwitchValue();
    this.userService.actualizar({
      usuarioRed: user.usuarioRed,
      superAdministrador: newValue,
    }, this.auth.usuarioRed()).subscribe({
      next: () => {
        // Actualizar el usuario en la lista
        this.usuarios.update((list) =>
          list.map((u) => u.usuarioRed === user.usuarioRed ? { ...u, superAdministrador: newValue ? 1 : 0 } : u)
        );
        this.filtrar();
      },
      error: () => {
        // Revertir el switch visualmente
        this.usuarios.update((list) =>
          list.map((u) => u.usuarioRed === user.usuarioRed ? { ...u } : u)
        );
        this.filtrar();
      },
    });
  }

  cancelarToggleSuperAdmin(): void {
    this.confirmVisible.set(false);
    // Revertir el switch visualmente re-filtrando
    const user = this.confirmUser();
    if (user) {
      this.usuarios.update((list) => list.map((u) => u.usuarioRed === user.usuarioRed ? { ...u } : u));
      this.filtrar();
    }
  }

  // ---------- Modal de detalle ----------
  readonly showDetalle = signal(false);
  readonly usuarioDetalle = signal<User | null>(null);
  readonly aplicacionesUsuario = signal<UserApplication[]>([]);
  readonly cargandoDetalle = signal(false);

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      searchTerm: [''],
      identificacion: [''],
      estado: [''],
      superAdmin: [''],
    });
    // Escuchar cambios en tiempo real
    this.filtrosForm.valueChanges.subscribe(() => this.filtrar());
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.userService.listar().subscribe({
      next: (res) => {
        this.usuarios.set(res.data ?? []);
        this.filtrar();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const v = this.filtrosForm?.getRawValue() ?? {};
    const term = (v.searchTerm ?? '').toLowerCase();
    const ident = (v.identificacion ?? '').toLowerCase();
    const estado = v.estado ?? '';
    const superAdmin = v.superAdmin ?? '';

    this.filteredUsers.set(
      this.usuarios().filter((u) => {
        const matchTerm = !term || u.usuarioRed.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term) || (u.correo ?? '').toLowerCase().includes(term);
        const matchIdent = !ident || u.numeroIdentificacion.toLowerCase().includes(ident);
        const matchEstado = !estado || u.estado === estado;
        const matchSuperAdmin = !superAdmin ||
          (superAdmin === 'SI' && u.superAdministrador === 1) ||
          (superAdmin === 'NO' && u.superAdministrador === 0);
        return matchTerm && matchIdent && matchEstado && matchSuperAdmin;
      })
    );
  }

  /** Limpia todos los filtros del formulario. */
  limpiarFiltros(): void {
    this.filtrosForm?.reset({ searchTerm: '', identificacion: '', estado: '', superAdmin: '' });
    this.filtrar();
  }

  // Getters para los FormControl de los selects
  get estadoControl(): FormControl { return this.filtrosForm.get('estado') as FormControl; }
  get superAdminControl(): FormControl { return this.filtrosForm.get('superAdmin') as FormControl; }

  abrirDetalle(user: User): void {
    this.usuarioDetalle.set(user);
    this.aplicacionesUsuario.set([]);
    this.showDetalle.set(true);
    this.cargandoDetalle.set(true);
    this.userService.aplicacionesPorUsuario(user.usuarioRed).subscribe({
      next: (res) => {
        this.aplicacionesUsuario.set(res.data ?? []);
        this.cargandoDetalle.set(false);
      },
      error: () => this.cargandoDetalle.set(false),
    });
  }

  cerrarDetalle(): void {
    this.showDetalle.set(false);
    this.usuarioDetalle.set(null);
    this.aplicacionesUsuario.set([]);
  }
}
