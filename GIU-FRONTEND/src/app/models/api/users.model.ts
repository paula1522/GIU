import { EstadoUsuario } from "../../utils/constants/estados.constants";

//  Responses 

export interface UsuarioResponseDTO {
  id: number;
  usuarioRed: string;
  nombre: string;
  correo: string;
  estado: EstadoUsuario;
  numeroIdentificacion: string;
  superAdministrador: number;
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
  rol?: UsuarioRolResponseDTO | null;
}

export interface UsuarioRolResponseDTO {
  usuarioRed: string;
  apliId: number;
  rolId: number;
  fechaIn: string | null;
  fechaFin: string | null;
}

export interface UsuarioAsignadoRol {
  id: number;
  usuarioRed: string;
  nombre: string;
  correo: string;
  numeroIdentificacion: string;
  estado: EstadoUsuario;
  apliId: number;
  rolId: number;
  fechaIn: string | null;
  fechaFin: string | null;
}

/**
 * DTO devuelto por GET /api/usuarios/{usuarioRed}/aplicaciones-roles
 * Si `nombreRol` es null → el usuario es admin de la app (sin rol específico).
 */
export interface UsuarioAplicacionRolDTO {
  nombreApli: string;
  rolId: number | null;
  nombreRol: string | null;
  fechaInRol: string | null;
  fechaFinRol: string | null;
  estadoApli: string;
  esAdminApli: boolean;
}

//  Requests 

export interface RetirarRolesUsuariosRequest {
  usuariosIds: number[];
}

export interface AsignarRolRequest {
  usuarioRed: string;
  rolId: number;
}

export interface GestionarRolesUsuariosRequest {
  usuariosRed: AsignarRolRequest[];
}

export interface GestionarEstadoUsuarioRequest {
  apliId: number;
  usuarioRed: string;
  operacion: number; // 0 = Activar, 2 = Desactivar
  rolId: number;
}

export interface ModificarUsuarioRequest {
  usuarioRed: string;
  nombre?: string;
  correo?: string;
  numeroIdentificacion?: string;
  superAdministrador?: boolean;
}