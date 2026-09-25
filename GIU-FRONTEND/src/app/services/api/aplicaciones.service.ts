import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  AdministradorAplicacionResponseDTO,
  GestionarAdministradorRequest,
} from '../../models/api/aplicaciones.model';
import { RespuestaGenerica } from '../../models/api/RespuestaGenerica.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AplicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.url_bff}/api`;

  listarAdministradores(filtros?: {
    usuarioRed?: string;
    apliId?: number;
    vigente?: boolean;
  }) {
    const params: any = {};
    if (filtros?.usuarioRed) params.usuarioRed = filtros.usuarioRed;
    if (filtros?.apliId != null) params.apliId = filtros.apliId;
    if (filtros?.vigente != null) params.vigente = filtros.vigente;

    return this.http.get<RespuestaGenerica<AdministradorAplicacionResponseDTO[]>>(
      `${this.apiUrl}/aplicaciones/administradores`,
      { params }
    );
  }

  crearAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ) {
    return this.http.post<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}/aplicaciones/administradores`,
      request,
      { headers: { usuarioModificacion } }
    );
  }

  retirarAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ) {
    return this.http.put<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}/aplicaciones/administradores`,
      request,
      { headers: { usuarioModificacion } }
    );
  }
}