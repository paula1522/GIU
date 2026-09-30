
//  Aplicaciones 

import { Administracion } from "../../utils/constants/administracion.constants";
import { Estado, EstadoUsuario } from "../../utils/constants/estados.constants";

export interface AplicacionResponseDTO {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  estado: Estado;                         
  administracion: Administracion;         
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
}

export interface CrearAplicacionRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  // true = PROPIA / false = PORTAL_CONFIGURACIONES
  administracion?: boolean;
}

export interface ModificarAplicacionRequest {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  // true = ACTIVO / false = INACTIVO
  estado?: boolean;
  // true = PROPIA / false = PORTAL_CONFIGURACIONES
  administracion?: boolean;
}

//  Administradores 

export interface GestionarAdministradorRequest {
  usuarioRed: string;
  apliId: number;
  fechaIn?: string | null;
  fechaFin?: string | null;
}

export interface AdministradorAplicacionResponseDTO {
  id: number;
  apliId: number;
  fechaIn: string | null;
  fechaFin: string | null;
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;

  usuarioId: number;
  usuarioRed: string;
  nombre: string;
  correo: string;
  numeroIdentificacion: string;
  estadoUsuario: EstadoUsuario;           
  esSuperAdmin: number;
  fechaCreacionUsuario: string | null;
  usuarioCreacionUsuario: string | null;
  fechaModificacionUsuario: string | null;
  usuarioModificacionUsuario: string | null;
}