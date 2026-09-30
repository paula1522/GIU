/**
 * Tipos de recurso/permiso disponibles.
 * Coinciden con los valores que acepta el backend.
 */
export const TipoRecurso = {
  MENU: 'MENU',
  PANTALLA: 'PANTALLA',
  BOTON: 'BOTON',
  OPCION: 'OPCION',
  SERVICIO: 'SERVICIO',
  FUNCIONALIDAD: 'FUNCIONALIDAD',
} as const;

export type TipoRecurso = typeof TipoRecurso[keyof typeof TipoRecurso];

/** Opciones para el componente <app-select>. */
export const TIPO_RECURSO_OPTIONS = [
  { id: TipoRecurso.MENU, nombre: 'MENU' },
  { id: TipoRecurso.PANTALLA, nombre: 'PANTALLA' },
  { id: TipoRecurso.BOTON, nombre: 'BOTON' },
  { id: TipoRecurso.OPCION, nombre: 'OPCION' },
  { id: TipoRecurso.SERVICIO, nombre: 'SERVICIO' },
  { id: TipoRecurso.FUNCIONALIDAD, nombre: 'FUNCIONALIDAD' },
];