/* GESTIONAR ASIGNACION DE ADMINISTRADORES */

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
  estadoUsuario: string;
  esSuperAdmin: number;
  fechaCreacionUsuario: string | null;
  usuarioCreacionUsuario: string | null;
  fechaModificacionUsuario: string | null;
  usuarioModificacionUsuario: string | null;
}