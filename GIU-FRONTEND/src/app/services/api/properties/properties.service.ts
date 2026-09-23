import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EncryptedHttpClient } from '../../../shared/encrypted-http-client';
import { PropertiesResponse } from '../../../models/domain/properties/properties.interface';
import { NotificationMessageService } from '../../../shared/atomic-desing/molecule/notification-message/notification-message.service';
import { Constantes } from '../../../utils/constants/Constantes';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  public baseUrl!: string;

  constructor(
    private http: EncryptedHttpClient,
    private msg: NotificationMessageService,
  ) {
    this.baseUrl = environment.url_bff;
  }

  postProperties(nameProperty: string[]): Observable<PropertiesResponse> {
    const url = this.baseUrl + '/properties/getProperty';
    const body = {
      names: nameProperty
    }
    
    return this.http.post<PropertiesResponse>(url, body)
      .pipe(
        catchError(err => {
          this.msg.openModal(
            {
              icon: Constantes.PATH_ICON_ERROR,
              title: 'Error consumiendo propiedades',
              comment: '',
              titleBtn1: 'Aceptar',
              closeOnBackdropClick: false
            },
            {
              btn1: () => {
                this.msg.closeModal();
              },
            }
          );
          return EMPTY;
        })
      );
  }
}
