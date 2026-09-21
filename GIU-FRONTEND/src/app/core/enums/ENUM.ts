/**
 * @autor Janel Góngora
 * 
 * @description: Enum que define los diferentes tipos de log que se pueden generar en la aplicación.
 */

export enum PeticionesHTTP {
  POST = 'POST',    // Método para enviar datos al servidor
  DELETE = 'DELETE',  // Método para eliminar recursos en el servidor
  GET = 'GET',     // Método para obtener datos del servidor
  PUT = 'PUT',     // Método para actualizar recursos en el servidor
  PATCH = 'PATCH', // Método para actualizar recursos en el servidor
}

export enum resStateServiceStatus {
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum resStateServiceChangeRequest {
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  ACKNOWLEDGED = 'ACKNOWLEDGED'
}
