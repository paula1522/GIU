import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleMockService } from '../../../services/mock/role-mock.service';
import { AuthService } from '../../../services/logic/auth.service';
import { Resource, Role } from '../../../models/domain/giu.models';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, ButtonComponent, ConfirmModalComponent, HeaderPagesComponent],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.scss',
})
export class PermissionsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleMockService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly recursos = signal<Resource[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRecursos = signal<Resource[]>([]);
  readonly apliId = signal(0);

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Código', 'Nombre', 'Descripción', 'Tipo', 'Estado', 'Acciones'];
  readonly columnsToDisplay = ['codigo', 'nombre', 'descripcion', 'tipo', 'estado', 'acciones'];

  readonly canCreate = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);
  readonly canEdit = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);
  readonly canDelete = this.auth.hasPermission(PERMISSIONS.APLICACIONES_EDITAR);

  /** Botones dinámicos para el header-pages. */
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

  /** Maneja los eventos de botones del header-pages. */
  onHeaderButtonClick(action: string): void {
    if (action === 'CREAR') {
      this.abrirCrear();
    }
  }

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.filteredRecursos().map((r) => this.buildRow(r));
  });

  private buildRow(r: Resource): ColumnConfig {
    const buttons: ActionButton[] = [];
    if (this.canEdit) {
      buttons.push({ label: 'Editar', action: 'EDITAR', title: 'Editar permiso', icon: 'bi bi-pencil-square', styles: 'btn-table-edit', type: 'button' });
    }
    if (this.canDelete) {
      buttons.push({ label: 'Eliminar', action: 'ELIMINAR', title: 'Eliminar permiso', icon: 'bi bi-trash', styles: 'btn-table-danger', type: 'button' });
    }

    return {
      _resource: r,
      codigo: { typeColum: typeColum.string, columValue: r.codigo },
      nombre: { typeColum: typeColum.string, columValue: r.nombre },
      descripcion: { typeColum: typeColum.string, columValue: r.descripcion || '—' },
      tipo: { typeColum: typeColum.string, columValue: r.tipo },
      estado: { typeColum: typeColum.status, columValue: r.estado, satusValue: r.estado === 'ACTIVO' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const resource: Resource = event.row._resource;
    if (event.action === 'EDITAR') {
      this.abrirEditar(resource);
    } else if (event.action === 'ELIMINAR') {
      this.confirmarEliminar(resource);
    }
  }

  // ---------- Modal crear/editar ----------
  readonly showForm = signal(false);
  readonly editingResource = signal<Resource | null>(null);
  readonly saving = signal(false);
  resourceForm!: FormGroup;

  /** Roles asociados al permiso en edición (solo lectura). */
  readonly rolesAsociados = signal<Role[]>([]);

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
    tipo: [{ type: 'required', message: 'El tipo es obligatorio.' }],
  };

  /** Opciones de tipo de recurso. */
  readonly tipoOptions = ['MENU', 'PANTALLA', 'BOTON', 'OPCION', 'SERVICIO', 'FUNCIONALIDAD'];

  // ---------- Modal confirmación eliminación ----------
  readonly confirmVisible = signal(false);
  readonly confirmResource = signal<Resource | null>(null);
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.cargar();
    this.resourceForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(200)]],
      tipo: ['', [Validators.required]],
    });
  }

  cargar(): void {
    this.loading.set(true);
    this.roleService.listarRecursos(this.apliId()).subscribe({
      next: (res) => { this.recursos.set(res.data ?? []); this.filtrar(); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  filtrar(): void {
    const term = this.searchTerm().toLowerCase();
    this.filteredRecursos.set(
      this.recursos().filter((r) => !term || r.nombre.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term) || r.tipo.toLowerCase().includes(term))
    );
  }

    abrirCrear(): void {
    this.editingResource.set(null);
    this.rolesAsociados.set([]);
    this.resourceForm?.reset({ codigo: '', nombre: '', descripcion: '', tipo: 'MENU' });
    this.showForm.set(true);
  }

  abrirEditar(resource: Resource): void {
    this.editingResource.set(resource);
    this.rolesAsociados.set([]);
    this.resourceForm?.patchValue({
      codigo: resource.codigo,
      nombre: resource.nombre,
      descripcion: resource.descripcion ?? '',
      tipo: resource.tipo,
    });
    // Cargar los roles asociados a este permiso
    this.roleService.obtenerRolesPorRecurso(this.apliId(), resource.id).subscribe({
      next: (res) => this.rolesAsociados.set(res.data ?? []),
      error: () => this.rolesAsociados.set([]),
    });
    this.showForm.set(true);
  }

  cerrarForm(): void { this.showForm.set(false); }

  guardar(): void {
    if (this.resourceForm.invalid) return;
    this.saving.set(true);
    const formValue = this.resourceForm.getRawValue();
    const resource = this.editingResource();
    if (resource) {
      this.roleService.actualizarRecurso(resource.id, {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        tipo: formValue.tipo,
      }, this.auth.usuarioRed())
        .subscribe({
          next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); },
          error: () => this.saving.set(false),
        });
    } else {
      this.roleService.crearRecurso({
        apliId: this.apliId(),
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        tipo: formValue.tipo,
        estado: 'ACTIVO',
      }, this.auth.usuarioRed())
        .subscribe({
          next: () => { this.saving.set(false); this.showForm.set(false); this.cargar(); },
          error: () => this.saving.set(false),
        });
    }
  }

  // ---------- Eliminación ----------
  confirmarEliminar(resource: Resource): void {
    this.confirmResource.set(resource);
    this.confirmMsg.set(`¿Desea eliminar el permiso "${resource.nombre}" (${resource.codigo})? Esta acción no se puede deshacer.`);
    this.confirmVisible.set(true);
  }

  ejecutarEliminar(): void {
    const resource = this.confirmResource();
    if (!resource) return;
    this.confirmVisible.set(false);
    this.roleService.eliminarRecurso(resource.id).subscribe(() => this.cargar());
  }
}
