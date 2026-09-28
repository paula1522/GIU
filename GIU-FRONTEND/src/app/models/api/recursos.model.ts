export interface RecursoResponseDTO {
  id: number;
  apliId: number;
  recuIdPadre: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
}

export interface CrearRecursoRequest {
  recuIdPadre?: number | null;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
}

export interface ModificarRecursoRequest {
  recuIdPadre?: number | null;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  estado: string;
}

export interface RolRecursoResponseDTO {
  id: number;
  recuId: number;
  rolId: number;
  apliId: number;
  rolNombre: string;
  rolDescripcion: string | null;
  rolEstado: string;
}