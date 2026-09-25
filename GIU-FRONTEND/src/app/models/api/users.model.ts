export interface UsuarioRolResponseDTO {
  usuarioRed: string;
  apliId: number;
  rolId: number;
  fechaIn: string | null;
  fechaFin: string | null;
}

export interface UsuarioResponseDTO {
  id: number;
  usuarioRed: string;
  nombre: string;
  correo: string;
  estado: string;
  numeroIdentificacion: string;
  superAdministrador: number;
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
  rol?: UsuarioRolResponseDTO | null;
}


export interface UsuarioAsignadoRol {
  usuarioRed: string;
  nombre: string;
  correo: string;
  numeroIdentificacion: string;
  estado: string;
  apliId: number;
  rolId: number;
  fechaIn: string | null;
  fechaFin: string | null;
}

export interface AsignarRolRequest {
  usuarioRed: string;
  rolId: number;
}

export interface GestionarRolesUsuariosRequest {
  usuariosRed: AsignarRolRequest[];
}