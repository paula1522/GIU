import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, withHashLocation, NoPreloading } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { CryptoKeyService } from './services/logic/crypto-key/crypto-key.service';
import { GlobalTokenService } from './services/api/global-token/global-token.service';
import { EncryptedHttpClient } from './shared/encrypted-http-client';

export function initializeApp(
  cryptoService: CryptoKeyService,
  globalTokenService: GlobalTokenService
) {
  return async () => {
    await cryptoService.generateKeyPair();
    await globalTokenService.loadServiceAes();
    cryptoService.setApplyCrypto(true);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Proporciona el enrutador con las rutas definidas
    provideRouter(routes, withHashLocation(), withPreloading(NoPreloading)),
    // Habilita la hidratación del cliente
 
    // Configura el cliente HTTP para los interceptores
    // provideHttpClient(withInterceptorsFromDi()),
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeApp,
    //   deps: [CryptoKeyService, GlobalTokenService],
    //   multi: true,
    // },
    EncryptedHttpClient,
    provideHttpClient(),
  ]
};
 