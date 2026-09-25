import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/domain/giu.models';
import { AsignarRolRequest, UsuarioAsignadoRol, UsuarioResponseDTO, UsuarioRolResponseDTO } from '../../models/api/users.model';


@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.url_bff}/api`;


  listarUsuarios(filtros?: {
    usuarioRed?: string;
    estado?: string;
  }): Observable<ApiResponse<UsuarioResponseDTO[]>> {
    let params = new HttpParams();

    if (filtros?.usuarioRed) {
      params = params.set('usuarioRed', filtros.usuarioRed);
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<ApiResponse<UsuarioResponseDTO[]>>(
      `${this.apiUrl}/usuarios`,
      { params }
    );
  }

  listarAsignacionesPorRol(
    rolId: number
  ): Observable<ApiResponse<UsuarioRolResponseDTO[]>> {
    return this.http.get<ApiResponse<UsuarioRolResponseDTO[]>>(
      `${this.apiUrl}/roles/${rolId}/usuarios`
    );
  }


  listarUsuariosPorRol(rolId: number): Observable<UsuarioAsignadoRol[]> {
    return forkJoin({
      asignaciones: this.listarAsignacionesPorRol(rolId),
      usuarios: this.listarUsuarios(),
    }).pipe(
      map(({ asignaciones, usuarios }) => {
        const asignacionesData = asignaciones.data ?? [];
        const usuariosData = usuarios.data ?? [];

        const indexUsuarios = new Map<string, UsuarioResponseDTO>();
        usuariosData.forEach((u) => indexUsuarios.set(u.usuarioRed, u));

        return asignacionesData.map<UsuarioAsignadoRol>((a) => {
          const info = indexUsuarios.get(a.usuarioRed);

          return {
            usuarioRed:           a.usuarioRed,
            nombre:               info?.nombre ?? '—',
            correo:               info?.correo ?? '—',
            numeroIdentificacion: info?.numeroIdentificacion ?? '—',
            estado:               info?.estado ?? '—',
            apliId:               a.apliId,
            rolId:                a.rolId,
            fechaIn:              a.fechaIn,
            fechaFin:             a.fechaFin,
          };
        });
      })
    );
  }




asignarRol(
  apliId: number,
  request: AsignarRolRequest,
  usuarioModificacion: string
): Observable<ApiResponse<UsuarioRolResponseDTO>> {
  const headers = new HttpHeaders().set('usuarioModificacion', usuarioModificacion);

  return this.http.post<ApiResponse<UsuarioRolResponseDTO>>(
    `${this.apiUrl}/aplicaciones/${apliId}/usuario/asignacion-rol`,
    request,
    { headers }
  );
}


retirarRoles(
  apliId: number,
  requests: AsignarRolRequest[],
  usuarioModificacion: string
): Observable<ApiResponse<UsuarioRolResponseDTO[]>> {
  const headers = new HttpHeaders().set('usuarioModificacion', usuarioModificacion);

  return this.http.delete<ApiResponse<UsuarioRolResponseDTO[]>>(
    `${this.apiUrl}/aplicaciones/${apliId}/usuario`,
    {
      headers,
      body: { usuariosRed: requests },
    }
  );
}
}

