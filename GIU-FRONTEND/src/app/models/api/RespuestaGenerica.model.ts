export interface RespuestaGenerica<T> {
  codigoRespuesta: string;
  descripcionRespuesta: string;
  data: T;
}