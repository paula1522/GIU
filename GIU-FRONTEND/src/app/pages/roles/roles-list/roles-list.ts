import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { Role } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { ConfirmModalComponent } from '../../../shared/molecule/confirm-modal/confirm-modal.component';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, ButtonComponent, ConfirmModalComponent, HeaderPagesComponent],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss',
})
export class RolesList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleMockService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRoles = signal<Role[]>([]);
  readonly apliId = signal(0);

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
    this.roleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
    });
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
    this.roleForm?.reset({ nombre: '', descripcion: '' });
    this.showForm.set(true);
  }

  abrirEditar(role: Role): void {
    this.editingRole.set(role);
    this.roleForm?.patchValue({ nombre: role.nombre, descripcion: role.descripcion ?? '' });
    this.showForm.set(true);
  }

  cerrarForm(): void { this.showForm.set(false); }

  guardar(): void {
    if (this.roleForm.invalid) return;
    this.saving.set(true);
    const formValue = this.roleForm.getRawValue();
    const role = this.editingRole();
    if (role) {
      this.roleService.actualizarRol({ id: role.id, apliId: this.apliId(), nombre: formValue.nombre, descripcion: formValue.descripcion }, this.auth.usuarioRed())
        .subscribe({ next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); }, error: () => this.saving.set(false) });
    } else {
      this.roleService.crearRol({ apliId: this.apliId(), nombre: formValue.nombre, descripcion: formValue.descripcion }, this.auth.usuarioRed())
        .subscribe({ next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); }, error: () => this.saving.set(false) });
    }
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
}
