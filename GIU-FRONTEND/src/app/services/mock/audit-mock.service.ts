import { Injectable } from '@angular/core';
import { BaseMockService } from './base-mock.service';
import { AuditEvent, AuditFilter, ApiResponse } from '../../models/domain/giu.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditMockService extends BaseMockService {
  private events: AuditEvent[] = this.generate();

  consultar(filtros: AuditFilter): Observable<ApiResponse<AuditEvent[]>> {
    let result = [...this.events];
    if (filtros.usuarioRed) result = result.filter((e) => e.usuarioRed.toLowerCase().includes(filtros.usuarioRed!.toLowerCase()));
    if (filtros.aplicacion) result = result.filter((e) => e.aplicacion?.toLowerCase().includes(filtros.aplicacion!.toLowerCase()));
    if (filtros.accion) result = result.filter((e) => e.accion.toLowerCase().includes(filtros.accion!.toLowerCase()));
    if (filtros.entidad) result = result.filter((e) => e.entidad === filtros.entidad);
    if (filtros.resultado) result = result.filter((e) => e.resultado === filtros.resultado);
    if (filtros.fechaInicio) result = result.filter((e) => e.fecha >= filtros.fechaInicio!);
    if (filtros.fechaFin) result = result.filter((e) => e.fecha <= filtros.fechaFin! + 'T23:59:59');
    return this.success(result);
  }

  private generate(): AuditEvent[] {
    const acciones = ['CREAR_APLICACION', 'MODIFICAR_APLICACION', 'CREAR_USUARIO', 'MODIFICAR_USUARIO', 'ACTIVAR_USUARIO', 'INACTIVAR_USUARIO', 'CREAR_ROL', 'ASIGNAR_ROL', 'ASIGNAR_ADMINISTRADOR'];
    const entidades = ['APLICACION', 'USUARIO', 'ROL', 'ADMINISTRADOR'];
    const usuarios = ['admin.giu', 'super.admin', 'admin.app1'];
    const events: AuditEvent[] = [];
    for (let i = 0; i < 25; i++) {
      events.push({
        id: i + 1,
        fecha: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        usuarioRed: usuarios[Math.floor(Math.random() * usuarios.length)],
        accion: acciones[Math.floor(Math.random() * acciones.length)],
        aplicacion: 'GIU',
        entidad: entidades[Math.floor(Math.random() * entidades.length)],
        identificador: `ID-${Math.floor(Math.random() * 1000)}`,
        valorAnterior: Math.random() > 0.5 ? '{"estado":"ACTIVO"}' : undefined,
        valorNuevo: Math.random() > 0.5 ? '{"estado":"INACTIVO"}' : undefined,
        ip: '10.0.0.' + Math.floor(Math.random() * 255),
        resultado: Math.random() > 0.2 ? 'EXITOSO' : 'ERROR',
        origen: 'WEB',
      });
    }
    return events.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
}
