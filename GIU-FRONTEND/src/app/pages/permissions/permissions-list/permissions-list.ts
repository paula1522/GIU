import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ResourcesService } from '../../../services/api/resources.service';
import { AuthService } from '../../../services/logic/auth.service';
import { RecursoResponseDTO, RolRecursoResponseDTO } from '../../../models/api/recursos.model';
import { PERMISSIONS } from '../../../utils/constants/permissions.constants';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { InputComponent } from '../../../shared/atomic-desing/atoms/inputs/input-general/input.component';
import { ButtonComponent } from '../../../shared/atomic-desing/atoms/button/button.component';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderButton, HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';
import { ModalComponent } from '../../../shared/atomic-desing/molecule/modal/modal.component';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, InputComponent, ButtonComponent, ConfirmModalComponent, HeaderPagesComponent, ModalComponent],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.scss',
})
export class PermissionsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly resourcesService = inject(ResourcesService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly recursos = signal<RecursoResponseDTO[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRecursos = signal<RecursoResponseDTO[]>([]);
  readonly apliId = signal(0);

  @ViewChild('modalForm') modalForm!: ModalComponent;
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

  private buildRow(r: RecursoResponseDTO): ColumnConfig {
    const buttons: ActionButton[] = [];
    if (this.canEdit) {
      buttons.push({ label: 'Editar', action: 'EDITAR', title: 'Editar permiso', icon: 'bi bi-pencil-square', class: 'btn-table-edit', type: 'button' });
    }
    if (this.canDelete) {
      buttons.push({ label: 'Eliminar', action: 'ELIMINAR', title: 'Eliminar permiso', icon: 'bi bi-trash', class: 'btn-table-danger', type: 'button' });
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
    const resource: RecursoResponseDTO = event.row._resource;
    if (event.action === 'EDITAR') {
      this.abrirEditar(resource);
    } else if (event.action === 'ELIMINAR') {
      this.confirmarEliminar(resource);
    }
  }

  // ---------- Modal crear/editar ----------
  
  readonly editingResource = signal<RecursoResponseDTO | null>(null);
  readonly saving = signal(false);
  resourceForm!: FormGroup;

  /** Roles asociados al permiso en edición (solo lectura). */
  readonly rolesAsociados = signal<RolRecursoResponseDTO[]>([]);

  readonly validationMessages: Record<string, { type: string; message: string }[]> = {
    codigo: [{ type: 'required', message: 'El código es obligatorio.' }],
    nombre: [{ type: 'required', message: 'El nombre es obligatorio.' }],
    tipo: [{ type: 'required', message: 'El tipo es obligatorio.' }],
  };

  /** Opciones de tipo de recurso. */
  readonly tipoOptions = ['MENU', 'PANTALLA', 'BOTON', 'OPCION', 'SERVICIO', 'FUNCIONALIDAD'];

  // ---------- Modal confirmación eliminación ----------
  readonly confirmVisible = signal(false);
  readonly confirmResource = signal<RecursoResponseDTO | null>(null);
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
    this.resourcesService.listarRecursos(this.apliId()).subscribe({
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
    this.modalForm?.open();
  }

  abrirEditar(resource: RecursoResponseDTO): void {
    this.editingResource.set(resource);
    this.rolesAsociados.set([]);
    this.resourceForm?.patchValue({
      codigo: resource.codigo,
      nombre: resource.nombre,
      descripcion: resource.descripcion ?? '',
      tipo: resource.tipo,
    });
    // Cargar los roles asociados a este permiso
    this.resourcesService.obtenerRolesPorRecurso(resource.id).subscribe({
      next: (res) => this.rolesAsociados.set(res.data ?? []),
      error: () => this.rolesAsociados.set([]),
    });
    this.modalForm?.open();
  }

  cerrarForm(): void { this.modalForm?.close(); }

  guardar(): void {
    if (this.resourceForm.invalid) return;
    this.saving.set(true);
    const formValue = this.resourceForm.getRawValue();
    const resource = this.editingResource();
    if (resource) {
      this.resourcesService.modificarRecurso(this.apliId(), resource.id, {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        tipo: formValue.tipo,
        estado: resource.estado,
      })
        .subscribe({
          next: () => { this.saving.set(false); this.cerrarForm(); this.cargar(); },
          error: () => this.saving.set(false),
        });
    } else {
      this.resourcesService.crearRecurso(this.apliId(), {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        tipo: formValue.tipo,
      })
        .subscribe({
          next: () => { this.saving.set(false); this.cerrarForm(); this.cargar(); },
          error: () => this.saving.set(false),
        });
    }
  }

  // ---------- Eliminación ----------
  confirmarEliminar(resource: RecursoResponseDTO): void {
    this.confirmResource.set(resource);
    this.confirmMsg.set(`¿Desea eliminar el permiso "${resource.nombre}" (${resource.codigo})? Esta acción no se puede deshacer.`);
    this.confirmVisible.set(true);
  }

  ejecutarEliminar(): void {
    const resource = this.confirmResource();
    if (!resource) return;
    this.confirmVisible.set(false);
  
    console.warn('Endpoint de eliminación de recursos no disponible.');
  }
}