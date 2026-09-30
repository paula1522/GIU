import { Estado } from './../../utils/constants/estados.constants';

//  Requests 

export interface CrearRolRequest {
  nombre: string;
  descripcion: string;
  recursos: number[];
}

export interface ModificarRolRequest {
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
}

export interface GestionarRecursosRolRequest {
  recursos: number[];
}

//  Responses 

export interface RecursosRolResponse {
  id: number;
  rolId: number;
  recuId: number;
  recuCodigo: string;
  recuNombre: string;
  recuTipo: string;
  recuEstado: Estado;         
}

export interface RolDetalleResponse {
  id: number;
  apliId: number;
  nombre: string;
  descripcion: string;
  estado: Estado;             
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion: string;
  usuarioModificacion: string;
  recursos?: RecursosRolResponse[];
}

export interface RolResponseDTO {
  id: number;
  apliId: number;
  nombre: string;
  descripcion: string;
  estado: Estado;             
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion: string;
  usuarioModificacion: string;
}