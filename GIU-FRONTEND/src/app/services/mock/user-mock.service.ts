import { Injectable, signal } from '@angular/core';
import { BaseMockService } from './base-mock.service';
import {
  User, UserApplication, CreateUserRequest, UpdateUserRequest,
  UserRoleAssignment, ApiResponse, Perfil,
} from '../../models/domain/giu.models';
import { Observable } from 'rxjs';

/**
 * Servicio mock de usuarios.
 */
@Injectable({ providedIn: 'root' })
export class UserMockService extends BaseMockService {
  private nextId = 6;
  private users: User[] = [
    { id: 1, usuarioRed: 'admin.giu', nombre: 'Admin GIU', correo: 'admin@claro.com.co', estado: 'ACTIVO', numeroIdentificacion: '1000001', superAdministrador: 1, perfilId: 1, perfilNombre: 'Administrador Total', esAdministrador: 1 },
    { id: 2, usuarioRed: 'user.test', nombre: 'Usuario Test', correo: 'test@claro.com.co', estado: 'ACTIVO', numeroIdentificacion: '1000002', superAdministrador: 0, perfilId: 2, perfilNombre: 'Usuario Consulta', esAdministrador: 0 },
    { id: 3, usuarioRed: 'maria.gomez', nombre: 'María Gómez', correo: 'mgomez@claro.com.co', estado: 'ACTIVO', numeroIdentificacion: '1000003', superAdministrador: 0, perfilId: 3, perfilNombre: 'Usuario Operativo', esAdministrador: 0 },
    { id: 4, usuarioRed: 'carlos.ruiz', nombre: 'Carlos Ruiz', correo: 'cruiz@claro.com.co', estado: 'INACTIVO', numeroIdentificacion: '1000004', superAdministrador: 0, perfilId: 2, perfilNombre: 'Usuario Consulta', esAdministrador: 0 },
    { id: 5, usuarioRed: 'ana.torres', nombre: 'Ana Torres', correo: 'atorres@claro.com.co', estado: 'ACTIVO', numeroIdentificacion: '1000005', superAdministrador: 0, perfilId: 1, perfilNombre: 'Administrador Total', esAdministrador: 1 },
  ];

  /** Perfiles disponibles para asignar a usuarios. */
  private perfiles: Perfil[] = [
    { id: 1, codigo: 'ADMIN_TOTAL', nombre: 'Administrador Total', descripcion: 'Acceso total al sistema', estado: 'ACTIVO' },
    { id: 2, codigo: 'USR_CONSULTA', nombre: 'Usuario Consulta', descripcion: 'Solo lectura', estado: 'ACTIVO' },
    { id: 3, codigo: 'USR_OPERATIVO', nombre: 'Usuario Operativo', descripcion: 'Operaciones de gestión', estado: 'ACTIVO' },
    { id: 4, codigo: 'USR_REPORTES', nombre: 'Usuario Reportes', descripcion: 'Generación de reportes', estado: 'ACTIVO' },
  ];

  private userApps: UserApplication[] = [
    { ...this.users[1], codigoApli: 'PORTAL_CLI', nombreApli: 'Portal Clientes', estadoApli: 'ACTIVO', idRol: 1, nombreRol: 'Administrador', fechaInRol: '2026-01-20T10:00:00' },
    { ...this.users[2], codigoApli: 'PORTAL_CLI', nombreApli: 'Portal Clientes', estadoApli: 'ACTIVO', idRol: 2, nombreRol: 'Consulta', fechaInRol: '2026-02-01T08:00:00' },
    { ...this.users[3], codigoApli: 'PORTAL_PAG', nombreApli: 'Portal Pagos', estadoApli: 'ACTIVO', idRol: 3, nombreRol: 'Auditor', fechaInRol: '2026-03-15T12:00:00' },
  ];

  /** Asignaciones de rol con fechas de vigencia. */
  private roleAssignments: UserRoleAssignment[] = [
    { usuarioRed: 'user.test', apliId: 1, rolId: 1, perfilId: 2, fechaIn: '2026-01-20', fechaFin: '2026-12-31' },
    { usuarioRed: 'maria.gomez', apliId: 1, rolId: 2, perfilId: 3, fechaIn: '2026-02-01' },
    { usuarioRed: 'carlos.ruiz', apliId: 2, rolId: 3, perfilId: 2, fechaIn: '2026-03-15', fechaFin: '2026-06-30' },
  ];

  readonly usuarios = signal<User[]>([...this.users]);
  readonly usuariosPorApp = signal<UserApplication[]>([...this.userApps]);
  readonly perfilesSignal = signal<Perfil[]>([...this.perfiles]);

  /** Lista todos los perfiles activos. */
  listarPerfiles(): Observable<ApiResponse<Perfil[]>> {
    return this.success(this.perfiles.filter((p) => p.estado === 'ACTIVO'));
  }

  /**
   * Busca un usuario por su usuarioRed exacto.
   * Retorna el usuario si existe, o null si no.
   */
  buscarPorUsuarioRed(usuarioRed: string): Observable<ApiResponse<User | null>> {
    const user = this.users.find((u) => u.usuarioRed.toLowerCase() === usuarioRed.toLowerCase().trim());
    return this.success(user ?? null);
  }

  listar(usuarioRed?: string, estado?: string): Observable<ApiResponse<User[]>> {
    let result = [...this.users];
    if (usuarioRed) result = result.filter((u) => u.usuarioRed.toLowerCase().includes(usuarioRed.toLowerCase()));
    if (estado) result = result.filter((u) => u.estado === estado);
    return this.success(result);
  }

  listarPorAplicacion(apliId: number): Observable<ApiResponse<UserApplication[]>> {
    const result = this.userApps.filter((u) => {
      const appMap: Record<number, string> = { 1: 'PORTAL_CLI', 2: 'PORTAL_PAG', 3: 'PORTAL_REP' };
      return u.codigoApli === appMap[apliId];
    });
    return this.success(result);
  }

  crear(request: CreateUserRequest, usuarioCreacion: string): Observable<ApiResponse<User>> {
    const perfil = this.perfiles.find((p) => p.id === request.perfilId);
    const newUser: User = {
      id: this.nextId++,
      usuarioRed: request.usuarioRed,
      nombre: request.nombre,
      correo: request.correo,
      estado: 'ACTIVO',
      numeroIdentificacion: request.numeroIdentificacion,
      superAdministrador: request.superAdministrador ? 1 : 0,
      perfilId: request.perfilId,
      perfilNombre: perfil?.nombre,
      esAdministrador: request.esAdministrador ? 1 : 0,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion,
    };
    this.users.push(newUser);
    this.usuarios.set([...this.users]);
    return this.success(newUser);
  }

  actualizar(request: UpdateUserRequest, usuarioModificacion: string): Observable<ApiResponse<User>> {
    const idx = this.users.findIndex((u) => u.usuarioRed === request.usuarioRed);
    if (idx >= 0) {
      const perfil = request.perfilId ? this.perfiles.find((p) => p.id === request.perfilId) : undefined;
      this.users[idx] = {
        ...this.users[idx],
        nombre: request.nombre ?? this.users[idx].nombre,
        correo: request.correo ?? this.users[idx].correo,
        numeroIdentificacion: request.numeroIdentificacion ?? this.users[idx].numeroIdentificacion,
        superAdministrador: request.superAdministrador !== undefined ? (request.superAdministrador ? 1 : 0) : this.users[idx].superAdministrador,
        perfilId: request.perfilId ?? this.users[idx].perfilId,
        perfilNombre: perfil?.nombre ?? this.users[idx].perfilNombre,
        esAdministrador: request.esAdministrador !== undefined ? (request.esAdministrador ? 1 : 0) : this.users[idx].esAdministrador,
        fechaModificacion: new Date().toISOString(),
        usuarioModificacion,
      };
      this.usuarios.set([...this.users]);
      return this.success(this.users[idx]);
    }
    return this.error('Usuario no encontrado.');
  }

  gestionarEstado(usuarioRed: string, activar: boolean): Observable<ApiResponse<string[]>> {
    const idx = this.users.findIndex((u) => u.usuarioRed === usuarioRed);
    if (idx >= 0) {
      this.users[idx].estado = activar ? 'ACTIVO' : 'INACTIVO';
      this.usuarios.set([...this.users]);
      return this.success([`Usuario ${activar ? 'activado' : 'inactivado'} correctamente.`]);
    }
    return this.error('Usuario no encontrado.');
  }

  /**
   * Asigna un rol a un usuario con fechas de vigencia opcionales.
   */
  asignarRol(asignacion: UserRoleAssignment): Observable<ApiResponse<UserRoleAssignment>> {
    // Evitar duplicados
    const existe = this.roleAssignments.find(
      (a) => a.usuarioRed === asignacion.usuarioRed && a.apliId === asignacion.apliId && a.rolId === asignacion.rolId
    );
    if (!existe) {
      this.roleAssignments.push(asignacion);
    }
    return this.success(asignacion);
  }

  /**
   * Lista los usuarios asignados a un rol específico en una aplicación.
   */
  listarPorRol(apliId: number, rolId: number): Observable<ApiResponse<UserApplication[]>> {
    const asignaciones = this.roleAssignments.filter((a) => a.apliId === apliId && a.rolId === rolId);
    const usuariosRol: UserApplication[] = asignaciones
      .map((a) => {
        const user = this.users.find((u) => u.usuarioRed === a.usuarioRed);
        if (!user) return null;
        const role = this.roleAssignments.find((ra) => ra.usuarioRed === a.usuarioRed && ra.apliId === apliId && ra.rolId === rolId);
        return {
          ...user,
          idRol: rolId,
          fechaInRol: role?.fechaIn,
          fechaFinRol: role?.fechaFin,
        } as UserApplication;
      })
      .filter((u): u is UserApplication => u !== null);
    return this.success(usuariosRol);
  }

  /**
   * Desasigna un usuario de un rol específico.
   */
  desasignarRol(usuarioRed: string, apliId: number, rolId: number): Observable<ApiResponse<string[]>> {
    const idx = this.roleAssignments.findIndex(
      (a) => a.usuarioRed === usuarioRed && a.apliId === apliId && a.rolId === rolId
    );
    if (idx >= 0) {
      this.roleAssignments.splice(idx, 1);
      return this.success(['Usuario desasignado del rol correctamente.']);
    }
    return this.error('Asignación no encontrada.');
  }
}
