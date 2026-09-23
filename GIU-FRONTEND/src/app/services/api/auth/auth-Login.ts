import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EncryptedHttpClient } from '../../../shared/encrypted-http-client';
import { NotificationMessageService } from '../../../shared/atomic-desing/molecule/notification-message/notification-message.service';
import { environment } from '../../../../environments/environment';
import { Constantes } from '../../../utils/constants/Constantes';
import { AuthResponse } from '../../../models/api/api-auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginService {
  private useMock = false;
  constructor(
    // private http: EncryptedHttpClient,
    private msg: NotificationMessageService,
  ) { }

  /* =========================
     Devuelve los recursos candidatos que el técnico puede elegir.
  ========================= */
  // login(user: string, password:string,id_apli:string,) {

  //   let params = new HttpParams()
  //     .set('user', user)
  //     .set('password', password);
  //   const baseUrl = `${environment.auth}/auth/login`;
  //   return this.http.post<AuthResponse>(baseUrl, {
  //     params
  //   }).pipe(
  //     catchError((error: any) => {
  //       const mensaje =
  //         error.error?.responseStatus?.statusMessage
  //         || 'Ocurrió un error al consultar Resources.';
  //       this.msg.openModal(
  //         {
  //           icon: Constantes.PATH_ICON_ERROR,
  //           title: 'Error consumiendo el servicio Resources',
  //           comment: mensaje,
  //           titleBtn1: 'Aceptar',
  //           closeOnBackdropClick: false
  //         },
  //         {
  //           btn1: () => {
  //             this.msg.closeModal();
  //           },
  //         }
  //       );
  //       return EMPTY;
  //     })
  //   );

  // }

}