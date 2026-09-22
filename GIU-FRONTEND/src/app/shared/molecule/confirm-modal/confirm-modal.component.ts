import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Modal de confirmación reutilizable para acciones destructivas.
 * Soporta título, mensaje, texto de botones y modo destructivo.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="overlay" (click)="onCancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ title }}</h2>
            <button class="modal-close" (click)="onCancel()" aria-label="Cerrar">✕</button>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="onCancel()">{{ cancelText }}</button>
            <button class="btn-confirm" [class.btn-danger]="isDestructive" [class.btn-primary]="!isDestructive" (click)="onConfirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 450px;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h2 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: #1a1a2e;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #64748b;
    }
    .modal-body {
      padding: 1.5rem;
    }
    .confirm-msg {
      font-size: 0.875rem;
      color: #1a1a2e;
      line-height: 1.5;
      margin: 0;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 0 1.5rem 1.5rem;
    }
    .btn-secondary {
      padding: 0.5rem 1rem;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      color: #1a1a2e;
      font-weight: 500;
    }
    .btn-confirm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .btn-primary {
      background: #e92012;
      color: #fff;
    }
    .btn-danger {
      background: #dc3545;
      color: #fff;
    }
  `],
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Está seguro?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() isDestructive = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
