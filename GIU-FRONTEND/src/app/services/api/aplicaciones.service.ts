import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  AdministradorAplicacionResponseDTO,
  GestionarAdministradorRequest,
} from '../../models/api/aplicaciones.model';
import { RespuestaGenerica } from '../../models/api/RespuestaGenerica.model';
import { environment } from '../../../environments/environment';
import { Constantes } from '../../utils/constants/Constantes';

@Injectable({ providedIn: 'root' })
export class AplicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${Constantes.CONST_ENDPOINT_BFF}/api/aplicaciones/administradores`;

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
      `${this.apiUrl}`,
      { params }
    );
  }

  crearAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ) {
    return this.http.post<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}`,
      request,
      { headers: { usuarioModificacion } }
    );
  }

  retirarAdministrador(
    request: GestionarAdministradorRequest,
    usuarioModificacion: string
  ) {
    return this.http.put<RespuestaGenerica<AdministradorAplicacionResponseDTO>>(
      `${this.apiUrl}`,
      request,
      { headers: { usuarioModificacion } }
    );
  }
}