import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @autor Janel Góngora
 *
 * @description Este componente representa un botón personalizable que puede incluir texto,
 * iconos y estilos. Además, emite un evento cuando se hace clic en él, permitiendo la
 * interacción con otros componentes o servicios en la aplicación.
 */
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ButtonComponent {
  @Input() title?: string; // Título opcional que puede mostrarse como tooltip
  @Input() text = ''; // Texto que se mostrará en el botón
  @Input() icon = ''; // Icono que se mostrará en el botón
  @Input() value = ''; // Valor del botón que se puede utilizar en formularios
  @Input() class: any = 'default-btn circle'; // Clase CSS adicional para el botón
  @Input() styles: string = ''; // Estilos adicionales para el botón
  @Input() figure: string = ''; // Clase CSS para modificar la figura del botón
  @Input() disabled = false; // Indica si el botón está deshabilitado
  @Input() textColor: string = ''; // Color del texto del botón
  @Input() srcImg = ''; // Fuente de la imagen
  @Input() position = ''; // Posición de las imágenes en relación al texto
  @Input() type: string = 'button'; // Tipo del botón (por defecto 'button')


  @Output() clickEventButton = new EventEmitter<any>(); // Evento emitido al hacer clic en el botón

  constructor() {
    if (this.figure || this.position) {
      this.styles = this.styles + ' ' + this.figure + " " + this.position;
    }
  }

  /**
   * Inicializa el componente y combina los estilos.
   */
  ngOnInit(): void {
    if (this.figure || this.position) {
      this.styles = this.styles + ' ' + this.figure + " " + this.position;
    }
  }

  /**
   * Emite un evento cuando se hace clic en el botón.
   */
  emitClick() {
    this.clickEventButton.emit(); // Emite el evento de clic
  }
}
