import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';

/** Configuración de un botón para el header. */
export interface HeaderButton {
  /** Texto del botón. */
  text: string;
  /** Ícono Bootstrap (ej: 'bi bi-person-plus'). */
  icon?: string;
  /** Clases CSS del átomo de botón (ej: ['btn', 'btn-primary']). */
  class?: any;
  /** Tipo del botón ('button' | 'submit'). */
  type?: string;
  /** Si el botón está deshabilitado. */
  disabled?: boolean;
  /** Identificador único para distinguir qué botón se presionó. */
  action: string;
}

/**
 * @description Molécula reutilizable para el encabezado de las vistas.
 * Recibe dinámicamente título, subtítulo y botones de acción.
 * Emite un evento cuando se presiona un botón, indicando cuál fue.
 */
@Component({
  selector: 'app-header-pages',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './header-pages.component.html',
  styleUrl: './header-pages.component.scss',
})
export class HeaderPagesComponent {
  /** Título principal de la vista. */
  @Input() title = '';
  /** Subtítulo descriptivo bajo el título. */
  @Input() subtitle = '';
  /** Lista de botones de acción a mostrar en el header. */
  @Input() buttons: HeaderButton[] = [];

  /** Emite el identificador `action` del botón presionado. */
  @Output() buttonClick = new EventEmitter<string>();

  /**
   * Maneja el clic de un botón y emite su action.
   */
  onButtonClick(action: string): void {
    this.buttonClick.emit(action);
  }
}
