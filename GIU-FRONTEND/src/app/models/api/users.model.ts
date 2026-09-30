
//  Responses 

import { EstadoUsuario } from "../../utils/constants/estados.constants";

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

//  Requests 

export interface AsignarRolRequest {
  usuarioRed: string;
  rolId: number;
}

export interface GestionarRolesUsuariosRequest {
  usuariosRed: AsignarRolRequest[];
}