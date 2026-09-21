import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { SliderService } from './slider.service';
import { Subscription } from 'rxjs';

/**
 * @autor Janel Góngora
 * 
 * @description Este componente maneja un control deslizante interactivo, el cual cambia de estado 
 * cuando se realiza una acción de clic o cuando recibe un evento de reinicio 
 * desde el servicio asociado `SliderService`.
 */

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  standalone: true,
  imports: [],
})
export class SliderComponent implements OnInit, OnDestroy {
  private resetSliderSubscription: Subscription = new Subscription();

  constructor(private sliderService: SliderService) { }

  @Input() sliderId: any; // ID del slider para identificarlo
  @Input() initialState: any; // Estado inicial del slider
  @Output() clickEventSlider = new EventEmitter<any>(); // Evento que se emite al hacer clic en el slider

  ngOnInit() {
    this.resetSliderSubscription = this.sliderService.resetSlider$.subscribe(
      (id: any) => {
        if (id === this.sliderId) {
          this.initialState = !this.initialState;
        }
      }
    );
  }

  /**
   * emitClick - Maneja el clic en el slider y emite un evento.
   * 
   * Cambia el estado del slider y emite un evento.
   */
  emitClick() {
    this.initialState = !this.initialState;
    this.clickEventSlider.emit();
  }

  /**
   * ngOnDestroy - Limpia la suscripción al destruir el componente.
   * 
   * Evita fugas de memoria al desuscribir el evento.
   */
  ngOnDestroy() {
    if (this.resetSliderSubscription) {
      this.resetSliderSubscription.unsubscribe();
    }
  }
}
