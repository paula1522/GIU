import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RespuestaGenerica } from '../../models/api/RespuestaGenerica.model';
import {
  RecursoResponseDTO,
  CrearRecursoRequest,
  ModificarRecursoRequest,
  RolRecursoResponseDTO,
} from '../../models/api/recursos.model';
import { Constantes } from '../../utils/constants/Constantes';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${Constantes.CONST_ENDPOINT_BFF}/api/aplicaciones`;

  listarRecursos(
    apliId: number,
  ): Observable<RespuestaGenerica<RecursoResponseDTO[]>> {

    return this.http.get<RespuestaGenerica<RecursoResponseDTO[]>>(
      `${this.apiUrl}/${apliId}/recursos`    );
  }

obtenerRolesPorRecurso(
  recuId: number
): Observable<RespuestaGenerica<RolRecursoResponseDTO[]>> {
  return this.http.get<RespuestaGenerica<RolRecursoResponseDTO[]>>(
    `${this.apiUrl}/recurso/${recuId}/roles`
  );
}

  crearRecurso(
    apliId: number,
    request: CrearRecursoRequest
  ): Observable<RespuestaGenerica<RecursoResponseDTO>> {
    return this.http.post<RespuestaGenerica<RecursoResponseDTO>>(
      `${this.apiUrl}/${apliId}/recursos`,
      request
    );
  }

  modificarRecurso(
    apliId: number,
    recuId: number,
    request: ModificarRecursoRequest
  ): Observable<RespuestaGenerica<RecursoResponseDTO>> {
    return this.http.put<RespuestaGenerica<RecursoResponseDTO>>(
      `${this.apiUrl}/${apliId}/recursos/${recuId}`,
      request
    );
  }
}