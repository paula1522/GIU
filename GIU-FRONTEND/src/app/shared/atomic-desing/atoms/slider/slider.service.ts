import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * @autor Janel Góngora
 * 
 * @description Servicio que gestiona la lógica para reiniciar sliders en la aplicación. Proporciona un mecanismo de comunicación a través de observables, permitiendo que otros componentes escuchen y reaccionen cuando un slider necesita ser reiniciado.
 */


@Injectable({
  providedIn: 'root',
})
export class SliderService {

  private resetSliderSubject = new Subject<void>();//Subject que emite eventos para notificar el reinicio de un slider.
  //Se expone como un observable para que otros componentes puedan suscribirse y recibir las notificaciones.
  resetSlider$ = this.resetSliderSubject.asObservable(); // Observable al cual los componentes pueden suscribirse para ser notificados cuando se debe reiniciar un slider.

  /**
   * @method notifyResetSlider
   * @description Notifica a los suscriptores que un slider ha sido reiniciado. Los suscriptores recibirán el `sliderId` como parte de la notificación.
   * @param {any} sliderId Identificador del slider que se desea reiniciar.
   * @returns {void}
   */
  notifyResetSlider(sliderId: any): void {
    this.resetSliderSubject.next(sliderId);
  }
}
