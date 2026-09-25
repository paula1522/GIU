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

export interface RecursosRolResponse {
  id: number;
  rolId: number;
  recuId: number;
  recuCodigo: string;
  recuNombre: string;
  recuTipo: string;
  recuEstado: string;
}

export interface RolDetalleResponse {
  id: number;
  apliId: number;
  nombre: string;
  descripcion: string;
  estado: string;
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
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion: string;
  usuarioModificacion: string;
}

export interface RecursoResponseDTO {
  id: number;
  apliId: number;
  recuIdPadre: number | undefined;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
}