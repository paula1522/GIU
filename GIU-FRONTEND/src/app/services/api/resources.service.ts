import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  listarRecursos(apliId: number,estado?: string
  ): Observable<RespuestaGenerica<RecursoResponseDTO[]>> {
  const url = `${this.apiUrl}/${apliId}/recursos`;
  const params = estado ? { estado } : undefined;

  return this.http.get<RespuestaGenerica<RecursoResponseDTO[]>>(url, { params });
}

  obtenerRolesPorRecurso(recuId: number): Observable<RespuestaGenerica<RolRecursoResponseDTO[]>> {
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


  eliminarRecurso(
    apliId: number,
    recuId: number
    ): Observable<RespuestaGenerica<String>> {
    return this.http.delete<RespuestaGenerica<String>>(
      `${this.apiUrl}/${apliId}/recursos/${recuId}`    );
  }

    
}