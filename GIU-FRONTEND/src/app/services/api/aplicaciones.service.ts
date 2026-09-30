import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AdministradorAplicacionResponseDTO,
  AplicacionResponseDTO,
  CrearAplicacionRequest,
  GestionarAdministradorRequest,
  ModificarAplicacionRequest,
} from '../../models/api/aplicaciones.model';
import { RespuestaGenerica } from '../../models/api/RespuestaGenerica.model';
import { Constantes } from '../../utils/constants/Constantes';

@Injectable({ providedIn: 'root' })
export class AplicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${Constantes.CONST_ENDPOINT_BFF}/api/aplicaciones`;

  //  Aplicaciones 

  listar(filtros: {
    codigo?: string;
    estado?: string;
    nombre?: string;
  } = {}): Observable<RespuestaGenerica<AplicacionResponseDTO[]>> {
    let params = new HttpParams();
    if (filtros.codigo) params = params.set('codigo', filtros.codigo);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);

    return this.http.get<RespuestaGenerica<AplicacionResponseDTO[]>>(
      this.apiUrl,
      { params }
    );
  }

  crear(
    request: CrearAplicacionRequest,
    usuarioCreacion: string
  ): Observable<RespuestaGenerica<AplicacionResponseDTO>> {
    const headers = new HttpHeaders({ usuarioCreacion });
    return this.http.post<RespuestaGenerica<AplicacionResponseDTO>>(
      this.apiUrl,
      request,
      { headers }
    );
  }

  modificar(
    id: number,
    request: ModificarAplicacionRequest,
    usuarioModificacion: string
  ): Observable<RespuestaGenerica<AplicacionResponseDTO>> {
    const headers = new HttpHeaders({ usuarioModificacion });
    return this.http.put<RespuestaGenerica<AplicacionResponseDTO>>(
      `${this.apiUrl}/${id}`,
      request,
      { headers }
    );
  }

  //  Administradores 

  listarAdministradores(filtros: {
    usuarioRed?: string;
    apliId?: number;
    vigente?: boolean;
  } = {}): Observable<RespuestaGenerica<AdministradorAplicacionResponseDTO[]>> {
    let params = new HttpParams();
    if (filtros.usuarioRed) params = params.set('usuarioRed', filtros.usuarioRed);
    if (filtros.apliId != null) params = params.set('apliId', String(filtros.apliId));
    if (filtros.vigente != null) params = params.set('vigente', String(filtros.vigente));

    return this.http.get<RespuestaGenerica<AdministradorAplicacionResponseDTO[]>>(
      `${this.apiUrl}/administradores`,
      { params }
    );
  }

  crearAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ): Observable<RespuestaGenerica<AdministradorAplicacionResponseDTO>> {
    return this.http.post<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}/administradores`,
      request,
      { headers: { usuarioModificacion } }
    );
  }

  retirarAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ): Observable<RespuestaGenerica<AdministradorAplicacionResponseDTO>> {
    return this.http.put<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}/administradores`,
      request,
      { headers: { usuarioModificacion } }
    );
  }
}