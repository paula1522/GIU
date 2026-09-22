import { Observable, of, delay } from 'rxjs';
import { ApiResponse } from '../../models/domain/giu.models';

/**
 * Clase base para servicios mock.
 * Proporciona utilidades para simular respuestas del backend.
 */
export abstract class BaseMockService {
  protected mockDelay = 300;

  protected success<T>(data: T): Observable<ApiResponse<T>> {
    return of({
      codigoRespuesta: '0',
      descripcionRespuesta: 'Operación exitosa',
      data,
    }).pipe(delay(this.mockDelay));
  }

  protected error<T>(message: string): Observable<ApiResponse<T>> {
    return of({
      codigoRespuesta: '1001',
      descripcionRespuesta: message,
      data: null as T,
    }).pipe(delay(this.mockDelay));
  }
}
