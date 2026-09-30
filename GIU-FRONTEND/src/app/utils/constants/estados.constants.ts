/**
 * Estado genérico para entidades activables/inactivables
 * (roles, recursos, aplicaciones, administradores...).
 */
export const Estado = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const;

export type Estado = typeof Estado[keyof typeof Estado];

export const ESTADO_OPTIONS = [
  { id: Estado.ACTIVO, nombre: 'Activo' },
  { id: Estado.INACTIVO, nombre: 'Inactivo' },
];

/**
 * Estado específico de usuarios, que además pueden estar BLOQUEADOS.
 */
export const EstadoUsuario = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  BLOQUEADO: 'BLOQUEADO',
} as const;

export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];

export const ESTADO_USUARIO_OPTIONS = [
  { id: EstadoUsuario.ACTIVO, nombre: 'Activo' },
  { id: EstadoUsuario.INACTIVO, nombre: 'Inactivo' },
  { id: EstadoUsuario.BLOQUEADO, nombre: 'Bloqueado' },
];