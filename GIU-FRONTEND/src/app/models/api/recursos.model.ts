
//  Responses 

import { Estado } from "../../utils/constants/estados.constants";
import { TipoRecurso } from "../../utils/constants/tipo-recurso.constants";

export interface RecursoResponseDTO {
  id: number;
  apliId: number;
  recuIdPadre: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: TipoRecurso;          
  estado: Estado;             
}

export interface RolRecursoResponseDTO {
  id: number;
  recuId: number;
  rolId: number;
  apliId: number;
  rolNombre: string;
  rolDescripcion: string | null;
  rolEstado: Estado;          
}

//  Requests 

export interface CrearRecursoRequest {
  recuIdPadre?: number | null;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoRecurso;          
}

export interface ModificarRecursoRequest {
  recuIdPadre?: number | null;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoRecurso;          
  estado: Estado;             
}