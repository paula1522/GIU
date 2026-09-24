import { Injectable, signal } from '@angular/core';
import { BaseMockService } from './base-mock.service';
import { Role, CreateRoleRequest, UpdateRoleRequest, ApiResponse, Resource, ResourceRole } from '../../models/domain/giu.models';
import { Observable } from 'rxjs';

/**
 * Servicio mock de roles y recursos.
 */
@Injectable({ providedIn: 'root' })
export class RoleMockService extends BaseMockService {
  private nextRoleId = 7;
  private nextRecId = 100;

  private roles: Role[] = [
    { id: 1, apliId: 1, nombre: 'Administrador', descripcion: 'Rol de administrador', estado: 'ACTIVO', fechaCreacion: '2026-01-15T10:00:00', usuarioCreacion: 'admin.giu' },
    { id: 2, apliId: 1, nombre: 'Consulta', descripcion: 'Rol de consulta', estado: 'ACTIVO', fechaCreacion: '2026-01-15T10:00:00', usuarioCreacion: 'admin.giu' },
    { id: 3, apliId: 2, nombre: 'Auditor', descripcion: 'Rol de auditoría', estado: 'ACTIVO', fechaCreacion: '2026-02-20T14:30:00', usuarioCreacion: 'admin.giu' },
    { id: 4, apliId: 1, nombre: 'Supervisor', descripcion: 'Rol de supervisor', estado: 'INACTIVO', fechaCreacion: '2026-03-01T09:00:00', usuarioCreacion: 'admin.giu' },
    { id: 5, apliId: 2, nombre: 'Administrador', descripcion: 'Rol de administrador de pagos', estado: 'ACTIVO', fechaCreacion: '2026-02-20T14:30:00', usuarioCreacion: 'admin.giu' },
    { id: 6, apliId: 3, nombre: 'Consulta', descripcion: 'Rol de consulta de reportes', estado: 'ACTIVO', fechaCreacion: '2026-03-10T09:00:00', usuarioCreacion: 'admin.giu' },
  ];

  private recursos: Resource[] = [];
  private recursosPorRol: ResourceRole[] = [];

  readonly rolesSignal = signal<Role[]>([...this.roles]);

  listarRoles(apliId: number): Observable<ApiResponse<Role[]>> {
    const result = this.roles.filter((r) => r.apliId === apliId);
    return this.success(result);
  }

  /**
   * Obtiene los roles que tienen asignado un recurso/permiso específico.
   */
  obtenerRolesPorRecurso(apliId: number, recuId: number): Observable<ApiResponse<Role[]>> {
    this.ensureRecursos(apliId);
    const rolIds = this.recursosPorRol
      .filter((rr) => rr.recuId === recuId)
      .map((rr) => rr.rolId);
    const rolesAsignados = this.roles.filter((r) => rolIds.includes(r.id));
    return this.success(rolesAsignados);
  }

  crearRol(request: CreateRoleRequest, usuarioCreacion: string): Observable<ApiResponse<Role>> {
    const newRole: Role = {
      id: this.nextRoleId++,
      apliId: request.apliId,
      nombre: request.nombre,
      descripcion: request.descripcion,
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion,
    };
    this.roles.push(newRole);
    this.rolesSignal.set([...this.roles]);
    return this.success(newRole);
  }

  actualizarRol(request: UpdateRoleRequest, usuarioModificacion: string): Observable<ApiResponse<Role>> {
    const idx = this.roles.findIndex((r) => r.id === request.id);
    if (idx >= 0) {
      this.roles[idx] = {
        ...this.roles[idx],
        nombre: request.nombre ?? this.roles[idx].nombre,
        descripcion: request.descripcion ?? this.roles[idx].descripcion,
        estado: request.estado !== undefined ? (request.estado ? 'ACTIVO' : 'INACTIVO') : this.roles[idx].estado,
        fechaModificacion: new Date().toISOString(),
        usuarioModificacion,
      };
      this.rolesSignal.set([...this.roles]);
      return this.success(this.roles[idx]);
    }
    return this.error('Rol no encontrado.');
  }

  listarRecursos(apliId: number): Observable<ApiResponse<Resource[]>> {
    this.ensureRecursos(apliId);
    const result = this.recursos.filter((r) => r.apliId === apliId);
    return this.success(result);
  }

  obtenerRecursosPorRol(apliId: number, rolId: number): Observable<ApiResponse<ResourceRole[]>> {
    this.ensureRecursos(apliId);
    const result = this.recursosPorRol.filter((r) => r.rolId === rolId);
    return this.success(result);
  }

  asignarRecursoRol(apliId: number, recuId: number, rolId: number): Observable<ApiResponse<ResourceRole>> {
    this.ensureRecursos(apliId);
    const existe = this.recursosPorRol.find((r) => r.rolId === rolId && r.recuId === recuId);
    if (!existe) {
      const recurso = this.recursos.find((r) => r.id === recuId);
      const nuevo: ResourceRole = {
        id: this.recursosPorRol.length + 1,
        rolId, recuId,
        recuCodigo: recurso?.codigo ?? '',
        recuNombre: recurso?.nombre ?? '',
        recuTipo: recurso?.tipo ?? '',
        recuEstado: recurso?.estado ?? 'ACTIVO',
      };
      this.recursosPorRol.push(nuevo);
      return this.success(nuevo);
    }
    return this.success(existe);
  }

  retirarRecursoRol(apliId: number, recuId: number, rolId: number): Observable<ApiResponse<ResourceRole>> {
    const idx = this.recursosPorRol.findIndex((r) => r.rolId === rolId && r.recuId === recuId);
    if (idx >= 0) {
      this.recursosPorRol.splice(idx, 1);
    }
    return this.success({ id: 0, rolId, recuId, recuCodigo: '', recuNombre: '', recuTipo: '', recuEstado: 'INACTIVO' });
  }

  private ensureRecursos(apliId: number): void {
    if (!this.recursos.some((r) => r.apliId === apliId)) {
      const tipos: Resource['tipo'][] = ['MENU', 'PANTALLA', 'BOTON', 'OPCION', 'SERVICIO'];
      const nombres = ['Usuarios', 'Roles', 'Recursos', 'Aplicaciones', 'Auditoría', 'Reportes'];
      nombres.forEach((nombre, i) => {
        this.recursos.push({
          id: apliId * 100 + i + 1,
          apliId,
          recuIdPadre: i > 2 ? apliId * 100 + 1 : undefined,
          codigo: `${nombre.toUpperCase().replace(/[^A-Z]/g, '')}_${apliId}`,
          nombre,
          descripcion: `Recurso ${nombre}`,
          tipo: tipos[i % tipos.length],
          estado: 'ACTIVO',
        });
      });
    }
  }

  // ==================== CRUD de Recursos / Permisos ====================

  crearRecurso(recurso: Partial<Resource> & { codigo: string; nombre: string; tipo: Resource['tipo'] }, usuarioCreacion: string): Observable<ApiResponse<Resource>> {
    const nuevo: Resource = {
      id: this.nextRecId++,
      apliId: recurso.apliId ?? 0,
      codigo: recurso.codigo,
      nombre: recurso.nombre,
      descripcion: recurso.descripcion,
      tipo: recurso.tipo,
      estado: recurso.estado ?? 'ACTIVO',
    };
    this.recursos.push(nuevo);
    return this.success(nuevo);
  }

  actualizarRecurso(id: number, cambios: Partial<Resource>, usuarioModificacion: string): Observable<ApiResponse<Resource>> {
    const idx = this.recursos.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.recursos[idx] = {
        ...this.recursos[idx],
        nombre: cambios.nombre ?? this.recursos[idx].nombre,
        codigo: cambios.codigo ?? this.recursos[idx].codigo,
        descripcion: cambios.descripcion ?? this.recursos[idx].descripcion,
        tipo: cambios.tipo ?? this.recursos[idx].tipo,
        estado: cambios.estado !== undefined ? (cambios.estado ? 'ACTIVO' : 'INACTIVO') : this.recursos[idx].estado,
      };
      return this.success(this.recursos[idx]);
    }
    return this.error('Recurso no encontrado.');
  }

  eliminarRecurso(id: number): Observable<ApiResponse<string[]>> {
    const idx = this.recursos.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.recursos.splice(idx, 1);
      // También retirar de todas las asignaciones de rol
      this.recursosPorRol = this.recursosPorRol.filter((r) => r.recuId !== id);
      return this.success(['Recurso eliminado correctamente.']);
    }
    return this.error('Recurso no encontrado.');
  }
}
