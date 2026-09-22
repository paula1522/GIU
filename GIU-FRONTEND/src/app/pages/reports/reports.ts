import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportMockService } from '../../services/mock/report-mock.service';
import { ReportUsersByApp, ReportRolesByApp, ReportPermissionsByRole, ReportAdminsByApp } from '../../models/domain/giu.models';
import { TableComponent } from '../../shared/atomic-desing/atoms/table/table.component';
import { ColumnConfig, typeColum } from '../../shared/atomic-desing/atoms/table/table.interface';
import { ButtonComponent } from '../../shared/atomic-desing/atoms/button/button.component';

type Tab = 'usuarios' | 'roles' | 'permisos' | 'administradores';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TableComponent, ButtonComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  private readonly reportService = inject(ReportMockService);

  readonly activeTab = signal<Tab>('usuarios');
  readonly loading = signal(false);
  readonly reporteUsuarios = signal<ReportUsersByApp[]>([]);
  readonly reporteRoles = signal<ReportRolesByApp[]>([]);
  readonly reportePermisos = signal<ReportPermissionsByRole[]>([]);
  readonly reporteAdmins = signal<ReportAdminsByApp[]>([]);

  // ---------- Configuración de tablas ----------
  readonly usuariosColTitles = ['Aplicación', 'Total', 'Activos', 'Inactivos'];
  readonly usuariosCols = ['apliNombre', 'totalUsuarios', 'activos', 'inactivos'];
  readonly usuariosData = computed<ColumnConfig[]>(() =>
    this.reporteUsuarios().map((r) => ({
      apliNombre: { typeColum: typeColum.string, columValue: r.apliNombre },
      totalUsuarios: { typeColum: typeColum.string, columValue: String(r.totalUsuarios) },
      activos: { typeColum: typeColum.status, columValue: String(r.activos), satusValue: true },
      inactivos: { typeColum: typeColum.status, columValue: String(r.inactivos), satusValue: false },
    } as ColumnConfig))
  );

  readonly rolesColTitles = ['Aplicación', 'Total', 'Activos', 'Inactivos'];
  readonly rolesCols = ['apliNombre', 'totalRoles', 'activos', 'inactivos'];
  readonly rolesData = computed<ColumnConfig[]>(() =>
    this.reporteRoles().map((r) => ({
      apliNombre: { typeColum: typeColum.string, columValue: r.apliNombre },
      totalRoles: { typeColum: typeColum.string, columValue: String(r.totalRoles) },
      activos: { typeColum: typeColum.status, columValue: String(r.activos), satusValue: true },
      inactivos: { typeColum: typeColum.status, columValue: String(r.inactivos), satusValue: false },
    } as ColumnConfig))
  );

  readonly adminsColTitles = ['Aplicación', 'Total', 'Administradores'];
  readonly adminsCols = ['apliNombre', 'totalAdministradores', 'administradores'];
  readonly adminsData = computed<ColumnConfig[]>(() =>
    this.reporteAdmins().map((r) => ({
      apliNombre: { typeColum: typeColum.string, columValue: r.apliNombre },
      totalAdministradores: { typeColum: typeColum.string, columValue: String(r.totalAdministradores) },
      administradores: { typeColum: typeColum.string, columValue: r.administradores.map((a) => a.usuarioRed).join(', ') || '—' },
    } as ColumnConfig))
  );

  ngOnInit(): void { this.cargarTab('usuarios'); }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.cargarTab(tab); }

  private cargarTab(tab: Tab): void {
    this.loading.set(true);
    switch (tab) {
      case 'usuarios':
        this.reportService.usuariosPorApp().subscribe({ next: (r) => { this.reporteUsuarios.set(r.data ?? []); this.loading.set(false); } });
        break;
      case 'roles':
        this.reportService.rolesPorApp().subscribe({ next: (r) => { this.reporteRoles.set(r.data ?? []); this.loading.set(false); } });
        break;
      case 'permisos':
        this.reportService.permisosPorRol().subscribe({ next: (r) => { this.reportePermisos.set(r.data ?? []); this.loading.set(false); } });
        break;
      case 'administradores':
        this.reportService.administradoresPorApp().subscribe({ next: (r) => { this.reporteAdmins.set(r.data ?? []); this.loading.set(false); } });
        break;
    }
  }

  exportarCsv(): void {
    let csv = '';
    if (this.activeTab() === 'usuarios') {
      csv = 'Aplicación,Total,Activos,Inactivos\n';
      this.reporteUsuarios().forEach(r => { csv += `${r.apliNombre},${r.totalUsuarios},${r.activos},${r.inactivos}\n`; });
    } else if (this.activeTab() === 'roles') {
      csv = 'Aplicación,Total,Activos,Inactivos\n';
      this.reporteRoles().forEach(r => { csv += `${r.apliNombre},${r.totalRoles},${r.activos},${r.inactivos}\n`; });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte_${this.activeTab()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }
}
