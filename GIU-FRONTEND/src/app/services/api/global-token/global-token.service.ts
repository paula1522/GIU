import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CryptoKeyService } from '../../logic/crypto-key/crypto-key.service';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResponseDataDesvare } from '../../../models/api/global-token/api-res.model';
import { EncryptedHttpClient } from '../../../shared/encrypted-http-client';

@Injectable({
  providedIn: 'root'
})
export class GlobalTokenService {

  public baseUrl!: string;

  constructor(private http: EncryptedHttpClient, private cryptoService: CryptoKeyService) {
    this.baseUrl = environment.url_bff;
  }

  postServiceTokenAES(data: any): Observable<HttpEvent<any>> {
    const url = this.baseUrl + '/security/generate-aes';
    return this.http.post<ResponseDataDesvare>(url, data);
  }

  async postRenewServiceTokenAES(): Promise<Observable<HttpEvent<any>>> {
    const key = await this.cryptoService.exportPublicKey();
    const url = this.baseUrl + '/servicio-aes-renovar';
    return this.http.post<ResponseDataDesvare>(url, { key });
  }

  async loadServiceAes() {
    try {
      const key = await this.cryptoService.exportPublicKey();
      const response: any = await firstValueFrom(
        this.postServiceTokenAES({ key })
      );

      const body = response instanceof HttpResponse
        ? response.body
        : response;

      const { nonce, data } = body || {};

      if (nonce && data) {
        const aes = await this.cryptoService.decryptKey(data);
        this.cryptoService.setNonceAes(nonce, aes);
      }
    } catch (exception) {
      throw exception;
    }
  }



}
