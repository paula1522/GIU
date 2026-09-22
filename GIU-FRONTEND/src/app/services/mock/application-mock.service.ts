import { Injectable, signal } from '@angular/core';
import { BaseMockService } from './base-mock.service';
import {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApiResponse,
  ApplicationAdministrator,
} from '../../models/domain/giu.models';
import { Observable } from 'rxjs';

/**
 * Servicio mock de aplicaciones.
 * Simula CRUD de aplicaciones hasta que el backend esté disponible.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationMockService extends BaseMockService {
  private nextId = 4;
  private apps: Application[] = [
    {
      id: 1, nombre: 'Portal Clientes', codigo: 'PORTAL_CLI', descripcion: 'Portal de clientes Claro',
      estado: 'ACTIVO', administracion: 'PROPIA', fechaCreacion: '2026-01-15T10:00:00',
      usuarioCreacion: 'admin.giu',
    },
    {
      id: 2, nombre: 'Portal Pagos', codigo: 'PORTAL_PAG', descripcion: 'Portal de pagos en línea',
      estado: 'ACTIVO', administracion: 'PROPIA', fechaCreacion: '2026-02-20T14:30:00',
      usuarioCreacion: 'admin.giu',
    },
    {
      id: 3, nombre: 'Portal Reportes', codigo: 'PORTAL_REP', descripcion: 'Portal de reportes gerenciales',
      estado: 'INACTIVO', administracion: 'PORTAL_CONFIGURACIONES', fechaCreacion: '2026-03-10T09:00:00',
      usuarioCreacion: 'admin.giu',
    },
  ];

  readonly aplicaciones = signal<Application[]>([...this.apps]);

  listar(codigo?: string, estado?: string): Observable<ApiResponse<Application[]>> {
    let result = [...this.apps];
    if (codigo) result = result.filter((a) => a.codigo.toLowerCase().includes(codigo.toLowerCase()));
    if (estado) result = result.filter((a) => a.estado === estado);
    this.aplicaciones.set(result);
    return this.success(result);
  }

  obtenerPorId(id: number): Observable<ApiResponse<Application | null>> {
    const app = this.apps.find((a) => a.id === id) ?? null;
    return this.success(app);
  }

  crear(request: CreateApplicationRequest, usuarioCreacion: string): Observable<ApiResponse<Application>> {
    const newApp: Application = {
      id: this.nextId++,
      nombre: request.nombre,
      codigo: request.codigo,
      descripcion: request.descripcion,
      estado: 'ACTIVO',
      administracion: request.administracion ? 'PORTAL_CONFIGURACIONES' : 'PROPIA',
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion,
    };
    this.apps.push(newApp);
    this.aplicaciones.set([...this.apps]);
    return this.success(newApp);
  }

  actualizar(id: number, request: UpdateApplicationRequest, usuarioModificacion: string): Observable<ApiResponse<Application>> {
    const idx = this.apps.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.apps[idx] = {
        ...this.apps[idx],
        nombre: request.nombre ?? this.apps[idx].nombre,
        codigo: request.codigo ?? this.apps[idx].codigo,
        descripcion: request.descripcion ?? this.apps[idx].descripcion,
        estado: request.estado !== undefined ? (request.estado ? 'ACTIVO' : 'INACTIVO') : this.apps[idx].estado,
        administracion: request.administracion !== undefined ? (request.administracion ? 'PORTAL_CONFIGURACIONES' : 'PROPIA') : this.apps[idx].administracion,
        fechaModificacion: new Date().toISOString(),
        usuarioModificacion,
      };
      this.aplicaciones.set([...this.apps]);
      return this.success(this.apps[idx]);
    }
    return this.error('Aplicación no encontrada.');
  }
}
