/**
 * Modelos de dominio de la aplicación GIU.
 * Basados en el modelo de datos de los scripts SQL y los DTOs del backend.
 */

// ---------- Aplicación ----------
export interface Application {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  administracion: 'PROPIA' | 'PORTAL_CONFIGURACIONES';
  fechaCreacion?: string;
  usuarioCreacion?: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface CreateApplicationRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  administracion?: boolean;
}

export interface UpdateApplicationRequest {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  estado?: boolean;
  administracion?: boolean;
}

// ---------- Usuario ----------

/** Perfil de usuario disponible para asignación. */
export interface Perfil {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface User {
  id: number;
  usuarioRed: string;
  nombre: string;
  correo: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  numeroIdentificacion: string;
  superAdministrador: number;
  perfilId?: number;
  perfilNombre?: string;
  esAdministrador?: number;
  fechaCreacion?: string;
  usuarioCreacion?: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface UserApplication extends User {
  codigoApli?: string;
  nombreApli?: string;
  estadoApli?: string;
  idRol?: number;
  nombreRol?: string;
  fechaInRol?: string;
  fechaFinRol?: string;
}

export interface CreateUserRequest {
  usuarioRed: string;
  nombre: string;
  correo: string;
  numeroIdentificacion: string;
  superAdministrador?: boolean;
  perfilId?: number;
  esAdministrador?: boolean;
}

export interface UpdateUserRequest {
  usuarioRed: string;
  nombre?: string;
  correo?: string;
  numeroIdentificacion?: string;
  superAdministrador?: boolean;
  perfilId?: number;
  esAdministrador?: boolean;
}

// ---------- Rol ----------
export interface Role {
  id: number;
  apliId: number;
  nombre: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  usuarioCreacion?: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface CreateRoleRequest {
  apliId: number;
  nombre: string;
  descripcion?: string;
}

export interface UpdateRoleRequest {
  id: number;
  apliId: number;
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
}

// ---------- Recurso / Permiso ----------
export interface Resource {
  id: number;
  apliId: number;
  recuIdPadre?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'MENU' | 'PANTALLA' | 'BOTON' | 'OPCION' | 'SERVICIO' | 'FUNCIONALIDAD';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface ResourceRole {
  id: number;
  rolId: number;
  recuId: number;
  recuCodigo: string;
  recuNombre: string;
  recuTipo: string;
  recuEstado: string;
}

// ---------- Administrador de Aplicación ----------
export interface ApplicationAdministrator {
  id: number;
  apliId: number;
  usuarioRed: string;
  nombre?: string;
  correo?: string;
  numeroIdentificacion?: string;
  estadoUsuario?: string;
  esSuperAdmin?: number;
  fechaIn?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  usuarioCreacion?: string;
}

// ---------- Asignación de Rol a Usuario ----------
export interface UserRoleAssignment {
  usuarioRed: string;
  apliId: number;
  rolId: number;
  perfilId?: number;
  fechaIn: string;
  fechaFin?: string;
}

// ---------- Auditoría ----------
export interface AuditEvent {
  id: number;
  fecha: string;
  usuarioRed: string;
  accion: string;
  aplicacion?: string;
  entidad?: string;
  identificador?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  ip?: string;
  resultado: 'EXITOSO' | 'ERROR';
  origen?: string;
}

export interface AuditFilter {
  fechaInicio?: string;
  fechaFin?: string;
  usuarioRed?: string;
  aplicacion?: string;
  accion?: string;
  entidad?: string;
  resultado?: string;
}

// ---------- Reportes ----------
export interface ReportUsersByApp {
  apliId: number;
  apliNombre: string;
  totalUsuarios: number;
  activos: number;
  inactivos: number;
}

export interface ReportRolesByApp {
  apliId: number;
  apliNombre: string;
  totalRoles: number;
  activos: number;
  inactivos: number;
}

export interface ReportPermissionsByRole {
  rolId: number;
  rolNombre: string;
  apliNombre: string;
  totalPermisos: number;
  permisos: { codigo: string; nombre: string }[];
}

export interface ReportAdminsByApp {
  apliId: number;
  apliNombre: string;
  totalAdministradores: number;
  administradores: { usuarioRed: string; nombre: string; fechaIn: string }[];
}

// ---------- Respuesta genérica ----------
export interface ApiResponse<T> {
  codigoRespuesta: string;
  descripcionRespuesta: string;
  data: T;
}

// ---------- Sesión ----------
export interface SessionState {
  usuarioRed: string;
  nombre: string;
  correo: string;
  superAdmin: boolean;
  permisos: string[];
  aplicacionActual?: Application;
}
