import {
  HttpClient,
  HttpHandler,
  HttpParams,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
  HttpEvent,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CryptoKeyService } from '../services/logic/crypto-key/crypto-key.service';
import { PeticionesHTTP } from '../core/enums/ENUM';
import { Constantes } from '../utils/constants/Constantes';
import { GlobalTokenService } from '../services/api/global-token/global-token.service';
import { KeysForEncryResponse } from '../models/domain/crypto-key/crypto-key.interface';

@Injectable()
export class EncryptedHttpClient extends HttpClient {
  private readonly defaultObserve = 'body';
  private readonly eventsObserve = 'events';
  private readonly responseObserve = 'response';

  private readonly mensajes = new Map<number, string>([
    [Constantes.HTTP_STATUS_CODE_500, Constantes.HTTP_STATUS_MSJ_500],
  ]);

  private _globalTokenService!: GlobalTokenService;
  private _cryptoService!: CryptoKeyService;
  private _cookieService!: CookieService;
  private _router!: Router;

  // ─── Getters perezosos (Lazy Getters) ──────────────────────────────────────

  private get router(): Router {
    if (!this._router) {
      this._router = this.injector.get(Router);
    }
    return this._router;
  }

  private get cryptoService(): CryptoKeyService {
    if (!this._cryptoService) {
      this._cryptoService = this.injector.get(CryptoKeyService);
    }
    return this._cryptoService;
  }

  private get globalTokenService(): GlobalTokenService {
    if (!this._globalTokenService) {
      this._globalTokenService = this.injector.get(GlobalTokenService);
    }
    return this._globalTokenService;
  }

  private get cookieService(): CookieService {
    if (!this._cookieService) {
      this._cookieService = this.injector.get(CookieService);
    }
    return this._cookieService;
  }

  constructor(
    handler: HttpHandler,
    private injector: Injector
  ) {
    super(handler);
  }

  // ─── Helpers y Utilidades ─────────────────────────────────────────────────

  private getMensaje(codigo: number): string {
    return this.mensajes.get(codigo) ?? 'Ocurrió un error, vuelva a intentarlo';
  }

  private isPathExcluded(path: string): boolean {
    if (typeof path !== 'string') return true;
    if (path.includes('wsProxy/cargueArchivo')) return false;

    const excludedPathList: string[] = [
      Constantes.CONST_ENDPOINT_SERGENERAL_LOGS,
      '/auth/token',
    ];
    return excludedPathList.some((excluded) => path.includes(excluded));
  }

  private cleanUrl(url: string): string {
    const queryIndex = url.indexOf('?');
    return queryIndex >= 0 ? url.substring(0, queryIndex) : url;
  }

  private extractQueryParams(urlWithParams: string): Record<string, string | string[]> {
    const queryIndex = urlWithParams.indexOf('?');
    if (queryIndex < 0) {
      return {};
    }

    const queryParams: Record<string, string | string[]> = {};
    const params = new URLSearchParams(urlWithParams.substring(queryIndex + 1));
    params.forEach((value, key) => {
      const currentValue = queryParams[key];
      if (currentValue === undefined) {
        queryParams[key] = value;
      } else if (Array.isArray(currentValue)) {
        currentValue.push(value);
      } else {
        queryParams[key] = [currentValue, value];
      }
    });

    return queryParams;
  }

  private headersToObject(headers: any): Record<string, string> {
    const headersObj: Record<string, string> = {};
    if (!headers?.keys || typeof headers.keys !== 'function') {
      return headersObj;
    }

    headers.keys().forEach((key: string) => {
      const value = headers.get(key);
      if (value) {
        headersObj[key] = value;
      }
    });

    return headersObj;
  }

  private buildEncryptedBffEnvelope(method: string, urlWithParams: string, headers: any, body: any): any {
    const combinedHeadersObj = {
      ...this.headersToObject(headers)
    };

    return {
      __bffEncryptedProxy: true,
      method,
      query: this.extractQueryParams(urlWithParams),
      headers: combinedHeadersObj,
      body: body ?? null
    };
  }

  private isEncryptedBffRequest(url: string): boolean {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.startsWith(Constantes.CONST_ENDPOINT_BFF)
      && !cleanUrl.includes('/security/generate-aes');
  }

  // ─── Clonación de Request e Intercepción ──────────────────────────────────

  private clonarRequest(req: HttpRequest<any>): HttpRequest<any> {
    const isFormData: boolean =
      req.body != null && req.body[Symbol.toStringTag] === 'FormData';

    if (isFormData) {
      return req;
    }

    if (req.url.includes('/security/generate-aes')) {
      return req.clone({
        body: req.body,
        method: PeticionesHTTP.POST,
        url: `${Constantes.CONST_ENDPOINT_BFF}/security/generate-aes`,
      });
    }

    // Procesa peticiones que van directo al BFF con encriptación
    if (this.isEncryptedBffRequest(req.urlWithParams) && this.cryptoService.getAes()) {
      const aesKey = this.cryptoService.getAes();
      const encryptedBody = this.encryptBody(
        this.buildEncryptedBffEnvelope(req.method, req.urlWithParams, req.headers, req.body),
        aesKey
      );
      
      const finalOptions = this.buildFinalOptions({ headers: req.headers });

      return req.clone({
        body: encryptedBody,
        method: PeticionesHTTP.POST,
        url: this.cleanUrl(req.url),
        params: new HttpParams(),
        headers: new HttpHeaders(finalOptions.headers)
      });
    }

    return req;
  }

  private ejecutar<T>(
    req: HttpRequest<any>,
    observe: 'body' | 'events' | 'response' = 'body'
  ): Observable<any> {
    const requiresBffCrypto = this.isEncryptedBffRequest(req.urlWithParams);
    
    if (requiresBffCrypto && !this.cryptoService.getAes()) {
      return from(this.globalTokenService.loadServiceAes()).pipe(
        switchMap(() => this.ejecutar<T>(req, observe))
      );
    }

    const aes = this.cryptoService.getAes();
    const clonada = this.clonarRequest(req);
    const body = clonada.body;
    let stringUrl = req.url + " " + (body && body.url ? body.url : "");

    return super.request<T>(clonada).pipe(
      filter((evt: HttpEvent<T>) => observe === this.eventsObserve || evt instanceof HttpResponse),
      map((evt: HttpEvent<T>) => {
        if (!(evt instanceof HttpResponse)) {
          return evt;
        }

        const responseProcesada = this.decryptResponse(evt, aes);
        return this.formatResponse(responseProcesada, observe);
      }),
      catchError((err) => {
        if (err.status === 498 && !clonada.headers.has('x-retry')) {
          const aes = this.cryptoService.getAes();
          const aesAux: KeysForEncryResponse = { key: aes.key, iv: aes.key };

          return from(this.globalTokenService.loadServiceAes()).pipe(
            switchMap(() => {
              const newNonce = this.cryptoService.getNonce();
              const aesKey = this.cryptoService.getAes();
              if (newNonce && aesKey?.key) {
                const body = clonada.body;
                const dataDecript = this.cryptoService.decrypt(body.data, {
                  key: aesAux.key,
                  iv: aesAux.key
                });
                const bodyEncript = {
                  data: this.cryptoService.encrypt(dataDecript, {
                    key: aesKey.key,
                    iv: aesKey.key
                  }).dataEncrypted
                };
                const clonedReq = clonada.clone({
                  body: bodyEncript,
                  setHeaders: {
                    'x-nonce': newNonce,
                    'x-retry': 'true'
                  }
                });

                return this.requestAsBody<T>(clonedReq, aesKey, observe);
              }
              return this.requestAsBody<T>(clonada, aesKey, observe);
            }),
            catchError((refreshError) => throwError(() => refreshError))
          );
        }
        
        if (this.isPathExcluded(stringUrl)) return throwError(() => err);
        
        return throwError(() => err);
      })
    );
  }

  // ─── Sobrescritura Métodos HTTP ───────────────────────────────────────────

  override get<T>(url: string, options?: any): Observable<any> {
    const req = new HttpRequest<T>(PeticionesHTTP.GET, url, null, options);
    return this.ejecutar<T>(req, this.getObserveMode(options));
  }

  override post<T>(url: string, body: any | null, options?: any): Observable<any> {
    const req = new HttpRequest<T>(PeticionesHTTP.POST, url, body, options);
    return this.ejecutar<T>(req, this.getObserveMode(options));
  }

  override put<T>(url: string, body: any | null, options?: any): Observable<any> {
    const req = new HttpRequest<T>(PeticionesHTTP.PUT, url, body, options);
    return this.ejecutar<T>(req, this.getObserveMode(options));
  }

  override patch<T>(url: string, body: any | null, options?: any): Observable<any> {
    const req = new HttpRequest<T>(PeticionesHTTP.PATCH, url, body, options);
    return this.ejecutar<T>(req, this.getObserveMode(options));
  }

  override delete<T>(url: string, options?: any): Observable<any> {
    const req = new HttpRequest<T>(PeticionesHTTP.DELETE, url, null, options);
    return this.ejecutar<T>(req, this.getObserveMode(options));
  }

  override request(first: string | HttpRequest<any>, url?: string, options?: any): Observable<any> {
    if (first instanceof HttpRequest) {
      return this.ejecutar(first, this.eventsObserve);
    }
    const req = new HttpRequest(
      first,
      url!,
      options?.body ?? null,
      options
    );

    return this.ejecutar(req, this.getObserveMode(options));
  }

  // ─── Encriptación, Desencriptación y Headers Finales ─────────────────────

  private encryptBody(body: any, aesKey: any) {
    if (!body) return null;

    return {
      data: this.cryptoService.encrypt(JSON.stringify(body), {
        key: aesKey.key,
        iv: aesKey.key
      }).dataEncrypted
    };
  }

  buildFinalOptions(options: any): any {
    const encryptedHeaders = this.buildEncryptedHeaders(options?.headers);
    const nonce = this.cryptoService.getNonce();

    const headers: Record<string, string> = {};

    if (encryptedHeaders?.['x-data']) {
      headers['x-data'] = encryptedHeaders['x-data'];
    }

    if (nonce) {
      headers['x-nonce'] = nonce;
    }

    return {
      headers
    };
  }

  buildEncryptedHeaders(headers: any): Record<string, string> | null {
    if (!headers) return null;

    const aesKey = this.cryptoService.getAes();
    if (!aesKey?.key) return null;

    const headersObj: Record<string, string> = {};

    if (headers.keys && typeof headers.keys === 'function') {
      headers.keys().forEach((key: string) => {
        const value = headers.get(key);
        if (value) headersObj[key] = value;
      });
    } else if (typeof headers === 'object') {
      Object.keys(headers).forEach(key => {
        const value = headers[key];
        if (value !== undefined && value !== null) {
          headersObj[key] = String(value);
        }
      });
    }

    if (Object.keys(headersObj).length === 0) return null;

    const encrypted = this.cryptoService.encrypt(JSON.stringify(headersObj), {
      key: aesKey.key,
      iv: aesKey.key
    });

    return { 'x-data': encrypted.dataEncrypted };
  }

  private decryptResponse<T>(resp: HttpResponse<T>, aesKey: any): HttpResponse<any> {
    const response: any = resp.body;

    if (response instanceof Blob || response instanceof ArrayBuffer) {
      return resp.clone({ body: response });
    }

    if (response === null || response === undefined) {
      return resp.clone({ body: response });
    }

    if (!response.data || typeof response.data !== 'string') {
      return resp.clone({ body: response });
    }

    if (aesKey?.key) {
      try {
        const decrypted = this.cryptoService.decrypt(response.data, {
          key: aesKey.key,
          iv: aesKey.key
        });

        let bodyFinal: any;

        try {
          bodyFinal = JSON.parse(decrypted);
        } catch {
          bodyFinal = decrypted;
        }

        return resp.clone({ body: bodyFinal });

      } catch (e) {
        return resp.clone({ body: response });
      }
    }

    return resp.clone({ body: response });
  }

  private requestAsBody<T>(
    request: HttpRequest<any>,
    aesKey: any,
    observe: 'body' | 'events' | 'response' = 'body'
  ): Observable<any> {
    return super.request<T>(request).pipe(
      filter((evt: HttpEvent<T>) => observe === this.eventsObserve || evt instanceof HttpResponse),
      map((evt: HttpEvent<T>) => {
        if (!(evt instanceof HttpResponse)) {
          return evt as any;
        }

        const responseProcesada = this.decryptResponse(evt, aesKey);
        return this.formatResponse(responseProcesada, observe);
      })
    );
  }

  private getObserveMode(options?: any): 'body' | 'events' | 'response' {
    if (options?.observe === this.eventsObserve) {
      return this.eventsObserve;
    }
    if (options?.observe === this.responseObserve) {
      return this.responseObserve;
    }
    return this.defaultObserve;
  }

  private formatResponse<T>(
    response: HttpResponse<T>,
    observe: 'body' | 'events' | 'response'
  ): HttpResponse<T> | T {
    if (observe === this.responseObserve || observe === this.eventsObserve) {
      return response;
    }

    return response.body as T;
  }

  private isPublicRoute(): boolean {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    return cleanUrl === '/' || cleanUrl.endsWith('/login') || cleanUrl.endsWith('/');
  }

  private obtenerUsuarioDeCookie(): string {
    try {
      const userCookie = this.cookieService.get('user');
      if (userCookie) {
        return atob(userCookie); // Decodifica el Base64 a texto plano
      }
    } catch (error) {
      console.error('Error al decodificar la cookie de usuario', error);
    }
    return 'ANONYMOUS'; // valor por defecto si falla o no existe
  }
}