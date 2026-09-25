import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonComponent],
})
export class ModalComponent implements OnDestroy {
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;

  @Input() title: string = '';
  @Input() confirmText: string = 'Aceptar';
  @Input() classConfirmBtn: string = "['btn', 'btn-primary']";
  @Input() cancelText: string = 'Cancelar';
  @Input() classCancelBtn: string = "['btn', 'btn-primary-secondary']";
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' | string = 'medium';
  @Input() showFooter: boolean = true;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() includeHeader: boolean = true;
  @Input() confirmDisabled: boolean = false;
  @Input() confirmLoading: boolean = false;
  @Input() loadingText: string = 'Guardando…';

  isOpen: boolean = false;
  private previousFocus: HTMLElement | null = null;

  @Output() closeMeEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() backClicEvent = new EventEmitter<void>();

  get sizeClass(): string {
    switch (this.size) {
      case 'small': return 'modal-sm';
      case 'medium': return 'modal-md';
      case 'large': return 'modal-lg';
      case 'xlarge': return 'modal-xl';
      default: return '';
    }
  }

  get confirmLabel(): string {
    return this.confirmLoading ? this.loadingText : this.confirmText;
  }

  open(): void {
    this.isOpen = true;
    this.previousFocus = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      this.modalContent?.nativeElement?.focus();
    }, 50);
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closeMeEvent.emit();
    if (this.previousFocus) {
      setTimeout(() => this.previousFocus?.focus(), 50);
    }
  }

  onBackdropClick(): void {
    this.backClicEvent.emit();
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  confirm(): void {
    if (this.confirmDisabled || this.confirmLoading) return;
    this.confirmEvent.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    if (event.key === 'Escape') {
      this.close();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
