import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  CrearRolRequest,
  GestionarRecursosRolRequest,
  RecursoResponseDTO,
  RecursosRolResponse,
  RolDetalleResponse,
  RolResponseDTO,
  ModificarRolRequest
} from '../../models/api/roles.model';

import { environment } from '../../../environments/environment';
import { RespuestaGenerica } from '../../models/api/RespuestaGenerica.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.url_bff}/api`;

  listarRoles(apliId: number) {
    return this.http.get<RespuestaGenerica<RolResponseDTO[]>>(
      `${this.apiUrl}/aplicaciones/${apliId}/roles`
    );
  }

  listarRecursos(apliId: number, estado: string = 'ACTIVO') {
    return this.http.get<RespuestaGenerica<RecursoResponseDTO[]>>(
      `${this.apiUrl}/aplicaciones/${apliId}/recursos`,
      {
        params: { estado }
      }
    );
  }

  crearRol(
    apliId: number,
    request: CrearRolRequest,
    usuarioCreacion: string
  ) {
    return this.http.post<RespuestaGenerica<RolResponseDTO>>(
      `${this.apiUrl}/aplicaciones/${apliId}/roles`,
      request,
      {
        headers: { usuarioCreacion }
      }
    );
  }

  modificarRol(
    apliId: number,
    rolId: number,
    request: ModificarRolRequest,
    usuarioModificacion: string
  ) {
    return this.http.put<RespuestaGenerica<RolResponseDTO>>(
      `${this.apiUrl}/aplicaciones/${apliId}/roles/${rolId}`,
      request,
      {
        headers: { usuarioModificacion }
      }
    );
  }

  asignarRecursos(
    rolId: number,
    request: GestionarRecursosRolRequest,
    usuarioModificacion: string
  ) {
    return this.http.post<RespuestaGenerica<RecursosRolResponse[]>>(
      `${this.apiUrl}/roles/${rolId}/recursos`,
      request,
      {
        headers: { usuarioModificacion }
      }
    );
  }

  retirarRecursos(
    rolId: number,
    request: GestionarRecursosRolRequest,
    usuarioModificacion: string
  ) {
    return this.http.delete<RespuestaGenerica<RecursosRolResponse[]>>(
      `${this.apiUrl}/roles/${rolId}/recursos`,
      {
        headers: { usuarioModificacion },
        body: request
      }
    );
  }

  obtenerDetalleRol(rolId: number) {
  return this.http.get<RespuestaGenerica<RolDetalleResponse>>(
    `${this.apiUrl}/aplicaciones/roles/${rolId}`
  );
}
}