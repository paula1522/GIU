/**
 * Tipo de administración de una aplicación.
 * Coincide con los valores que devuelve el backend.
 */
export const Administracion = {
  PROPIA: 'PROPIA',
  PORTAL_CONFIGURACIONES: 'PORTAL_CONFIGURACIONES',
} as const;

export type Administracion = typeof Administracion[keyof typeof Administracion];