import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApplicationMockService } from '../../../services/mock/application-mock.service';
import { ApplicationAdministrator } from '../../../models/domain/giu.models';
import { TableComponent } from '../../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, ActionButton, typeColum } from '../../../shared/atomic-desing/atoms/table/table.interface';
import { ConfirmModalComponent } from '../../../shared/atomic-desing/molecule/confirm-modal/confirm-modal.component';
import { HeaderPagesComponent } from '../../../shared/atomic-desing/molecule/header-pages/header-pages.component';

@Component({
  selector: 'app-administrators-list',
  standalone: true,
  imports: [CommonModule, TableComponent, ConfirmModalComponent, HeaderPagesComponent],
  template: `
    <app-header-pages
    [title]="'Administradores'"
    [subtitle]="'Listado de las personas que pueden gestionar roles/permisos/usuarios para la aplicación seleccionada '"
    ></app-header-pages>


    <div class="page">
      @if (loading()) { <div class="loading">Cargando…</div> }
      @else {
        <app-table
          [tableTitle]="''"
          [tableColumnTitle]="tableColumnTitle"
          [columnsToDisplay]="columnsToDisplay"
          [dataSource]="tableData()"
          [showPaginator]="true"
          [totalItemsPerPag]="10"
          [idTable]="'administrators-list'"
          (clickEventButton)="onTableAction($event)"
        ></app-table>
      }
    </div>

    <app-confirm-modal
      [visible]="confirmVisible()"
      title="Eliminar administrador"
      [message]="confirmMsg()"
      confirmText="Eliminar"
      [isDestructive]="true"
      (confirm)="ejecutarEliminar()"
      (cancel)="confirmVisible.set(false)"
    ></app-confirm-modal>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #1a1a2e; }
    .loading { padding: 2rem; text-align: center; color: #64748b; }
    ::ng-deep .btn-table-danger {
      background: #dc3545 !important; color: #fff !important;
      border: none !important; padding: 0.3rem 0.7rem !important;
      border-radius: 6px !important; font-size: 0.75rem !important;
      cursor: pointer !important; font-weight: 500 !important;
    }
  `],
})
export class AdministratorsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appService = inject(ApplicationMockService);

  readonly loading = signal(false);
  readonly administradores = signal<ApplicationAdministrator[]>([]);
  readonly apliId = signal(0);

  // ---------- Configuración del átomo de Tabla ----------
  readonly tableColumnTitle = ['Usuario', 'Nombre', 'Correo', 'Estado', 'Fecha asignación', 'Acciones'];
  readonly columnsToDisplay = ['usuarioRed', 'nombre', 'correo', 'estadoUsuario', 'fechaIn', 'acciones'];

  readonly tableData = computed<ColumnConfig[]>(() => {
    return this.administradores().map((a) => this.buildRow(a));
  });

  private buildRow(a: ApplicationAdministrator): ColumnConfig {
    const buttons: ActionButton[] = [
      { label: 'Eliminar', action: 'ELIMINAR', title: 'Eliminar administrador', icon: 'bi bi-trash', styles: 'btn-table-danger', type: 'button' },
    ];
    return {
      _admin: a,
      usuarioRed: { typeColum: typeColum.string, columValue: a.usuarioRed },
      nombre: { typeColum: typeColum.string, columValue: a.nombre || '—' },
      correo: { typeColum: typeColum.string, columValue: a.correo || '—' },
      estadoUsuario: { typeColum: typeColum.status, columValue: a.estadoUsuario || '—', satusValue: a.estadoUsuario === 'ACTIVO' },
      fechaIn: { typeColum: typeColum.string, columValue: a.fechaIn || '—' },
      acciones: { typeColum: typeColum.button, actionButtons: buttons },
    } as ColumnConfig;
  }

  onTableAction(event: { action: string; row: any; idTable: string }): void {
    const admin: ApplicationAdministrator = event.row._admin;
    if (event.action === 'ELIMINAR') {
      this.confirmarEliminar(admin);
    }
  }

  // Confirmación
  readonly confirmVisible = signal(false);
  readonly confirmAdmin = signal<ApplicationAdministrator | null>(null);
  readonly confirmMsg = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('apliId'));
    this.apliId.set(id);
    this.administradores.set([
      { id: 1, apliId: id, usuarioRed: 'admin.app1', nombre: 'Admin App 1', correo: 'admin1@claro.com.co', estadoUsuario: 'ACTIVO', fechaIn: '2026-01-15T10:00:00' },
      { id: 2, apliId: id, usuarioRed: 'admin.app2', nombre: 'Admin App 2', correo: 'admin2@claro.com.co', estadoUsuario: 'ACTIVO', fechaIn: '2026-02-01T08:30:00' },
      { id: 3, apliId: id, usuarioRed: 'admin.app3', nombre: 'Admin App 3', correo: 'admin3@claro.com.co', estadoUsuario: 'INACTIVO', fechaIn: '2026-02-15T14:00:00' },
    ]);
    this.loading.set(false);
  }

  confirmarEliminar(a: ApplicationAdministrator): void {
    this.confirmAdmin.set(a);
    this.confirmMsg.set(`¿Desea eliminar a "${a.nombre ?? a.usuarioRed}" como administrador? Esta acción no se puede deshacer.`);
    this.confirmVisible.set(true);
  }

  ejecutarEliminar(): void {
    const a = this.confirmAdmin();
    if (!a) return;
    this.confirmVisible.set(false);
    this.administradores.update((list) => list.filter((x) => x.id !== a.id));
  }
}
