import { Injectable } from '@angular/core';
import { BaseMockService } from './base-mock.service';
import {
  ReportUsersByApp, ReportRolesByApp, ReportPermissionsByRole, ReportAdminsByApp, ApiResponse,
} from '../../models/domain/giu.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportMockService extends BaseMockService {
  usuariosPorApp(): Observable<ApiResponse<ReportUsersByApp[]>> {
    return this.success([
      { apliId: 1, apliNombre: 'Portal Clientes', totalUsuarios: 120, activos: 95, inactivos: 25 },
      { apliId: 2, apliNombre: 'Portal Pagos', totalUsuarios: 45, activos: 40, inactivos: 5 },
      { apliId: 3, apliNombre: 'Portal Reportes', totalUsuarios: 30, activos: 28, inactivos: 2 },
    ]);
  }

  rolesPorApp(): Observable<ApiResponse<ReportRolesByApp[]>> {
    return this.success([
      { apliId: 1, apliNombre: 'Portal Clientes', totalRoles: 4, activos: 3, inactivos: 1 },
      { apliId: 2, apliNombre: 'Portal Pagos', totalRoles: 2, activos: 2, inactivos: 0 },
      { apliId: 3, apliNombre: 'Portal Reportes', totalRoles: 1, activos: 1, inactivos: 0 },
    ]);
  }

  permisosPorRol(): Observable<ApiResponse<ReportPermissionsByRole[]>> {
    return this.success([
      { rolId: 1, rolNombre: 'Administrador', apliNombre: 'Portal Clientes', totalPermisos: 8, permisos: [
        { codigo: 'USUARIOS_VER', nombre: 'Ver usuarios' }, { codigo: 'USUARIOS_CREAR', nombre: 'Crear usuarios' },
      ]},
      { rolId: 2, rolNombre: 'Consulta', apliNombre: 'Portal Clientes', totalPermisos: 2, permisos: [
        { codigo: 'USUARIOS_VER', nombre: 'Ver usuarios' },
      ]},
    ]);
  }

  administradoresPorApp(): Observable<ApiResponse<ReportAdminsByApp[]>> {
    return this.success([
      { apliId: 1, apliNombre: 'Portal Clientes', totalAdministradores: 2, administradores: [
        { usuarioRed: 'admin.app1', nombre: 'Admin App 1', fechaIn: '2026-01-15T10:00:00' },
      ]},
      { apliId: 2, apliNombre: 'Portal Pagos', totalAdministradores: 1, administradores: [
        { usuarioRed: 'admin.app2', nombre: 'Admin App 2', fechaIn: '2026-02-20T14:30:00' },
      ]},
    ]);
  }
}
