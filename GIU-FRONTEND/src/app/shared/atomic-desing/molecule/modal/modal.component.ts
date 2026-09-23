import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';

/**
 * @autor Janel Góngora
 * 
 * @description Este componente proporciona una interfaz de usuario para mostrar información
 * y recibir confirmación del usuario. Permite configurar el tamaño, el texto de
 * los botones de confirmación y cancelación, y manejar eventos de cierre.
 */

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonComponent ],
})
export class ModalComponent {
  @ViewChild('modal', { static: false }) modal!: ElementRef; // Referencia al elemento modal.

  @Input() title!: string; // Título del modal.
  @Input() confirmText?: string = "Aceptar"; // Texto del botón de confirmación.
  @Input() classConfirmBtn?: string; // Clase CSS del botón de confirmación.
  @Input() cancelText?: string = "Cancelar"; // Texto del botón de cancelación.
  @Input() classCancelBtn?: string; // Clase CSS del botón de cancelación.
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' | string = 'medium'; // Configuración del tamaño del modal.
  @Input() showFooter = true; // Indica si se debe mostrar el pie del modal.
  @Input() closeOnBackdropClick: boolean = false; // Indica si el modal se cierra al hacer clic en el fondo.
  @Input() includeHeader : boolean = true;

  isOpen: boolean = false; // Estado del modal (abierto o cerrado).

  @Output() closeMeEvent = new EventEmitter<void>(); // Evento emitido al cerrar el modal.
  @Output() confirmEvent = new EventEmitter<void>(); // Evento emitido al confirmar la acción.
  @Output() backClicEvent = new EventEmitter<void>(); // Evento emitido al hacer clic en el fondo.

  /**
   * sizeClass - Propiedad computada que devuelve la clase CSS correspondiente al tamaño del modal.
   */
  get sizeClass(): string {
    switch (this.size) {
      case 'small': return 'modal-sm';
      case 'medium': return 'modal-md';
      case 'large': return 'modal-lg';
      case 'xlarge': return 'modal-xl';
      default: return '';
    }
  }

  /**
   * open - Método que abre el modal.
   */
  open() {
    this.isOpen = true;
  }

  /**
   * close - Método que cierra el modal y emite el evento de cierre.
   */
  close() {
    this.isOpen = false;
    this.closeMeEvent.emit();
  }

  /**
   * onBackdropClick - Maneja el clic en el fondo del modal.
   * 
   * Este método cierra el modal si la propiedad closeOnBackdropClick está activada.
   * También emite un evento para notificar sobre el clic en el fondo.
   */
  onBackdropClick() {
    this.backClicEvent.emit();
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  /**
   * confirm - Método que maneja la confirmación de la acción.
   * 
   * Cierra el modal y emite el evento de confirmación.
   */
  confirm() {
    this.close();
    this.confirmEvent.emit();
  }
}
