import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { Role, Resource } from '../../../models/domain/giu.models';
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
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRoles = signal<Role[]>([]);
  readonly apliId = signal(0);

  /** Recursos/permisos disponibles para la aplicación. */
  readonly recursos = signal<Resource[]>([]);

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
    this.roleForm?.reset({ nombre: '', descripcion: '' });
    this.buildPermisosCheckboxes([]);
    this.showForm.set(true);
  }

  abrirEditar(role: Role): void {
    this.editingRole.set(role);
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
}
