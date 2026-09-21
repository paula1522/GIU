import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms'; // 🔥 IMPORTANTE
import { FormControl, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
  ]
})
export class SelectComponent implements OnInit {

  @Input() id!: string;
  @Input() control!: FormControl;
  @Input() options: any[] = [];
  @Input() textLabel?: string;
  @Input() displayKey: string = 'nameSelect';
  @Input() valueKey: string = 'id';
  @Input() srcImgLeft?: string;
  @Input() defaultOption: string = '';
  @Input() showRequiredMark = true;

  @Input() count_validation_messages: {
    [key: string]: { type: string; message: string }[];
  } = {};

  @Output() selectionChange = new EventEmitter<any>();

  filteredMessages: { type: string; message: string }[] = [];

  /**
   * Indica si el dropdown está abierto
   */
  isOpen = false;

  ngOnInit(): void {
    this.setValidationMessages();
    this.setRequiredMark();
  }

  private setValidationMessages(): void {
    const controlName = this.getControlName();

    if (
      controlName &&
      this.count_validation_messages[controlName]
    ) {
      this.filteredMessages =
        this.count_validation_messages[controlName];
    }
  }

  private setRequiredMark(): void {
    if (
      this.textLabel &&
      this.showRequiredMark &&
      this.control?.hasValidator(Validators.required)
    ) {
      this.textLabel = `(*) ${this.textLabel}`;
    }
  }

  isSelected(option: any): boolean {
    return String(option[this.valueKey]) === String(this.control?.value);
  }

  private getControlName(): string | null {
    const parent = this.control?.parent;

    if (!parent) {
      return null;
    }

    return Object.keys(parent.controls)
      .find(name => parent.get(name) === this.control) ?? null;
  }

  get controlInvalid(): boolean {
    return !!this.control?.invalid && this.control?.touched;
  }

  hasError(type: string): boolean {
    return !!this.control?.hasError(type) &&
      (this.control.dirty || this.control.touched);
  }

  /**
   * Indica si existe un valor seleccionado
   */
  get hasValue(): boolean {
    const value = this.control?.value;

    return value !== null &&
      value !== undefined &&
      value !== '';
  }

  /**
   * Obtiene la opción actualmente seleccionada
   */
  get selectedOption(): any | null {
    if (!this.hasValue) {
      return null;
    }

    return this.options.find(
      option => String(option[this.valueKey]) === String(this.control.value)
    ) ?? null;
  }

  /**
   * Texto que se muestra en el selector
   */
  get selectedLabel(): string {
    if (this.selectedOption) {
      return this.selectedOption[this.displayKey];
    }

    return this.defaultOption;
  }

  /**
   * Abre / cierra el dropdown
   */
  toggleDropdown(): void {
    if (this.control?.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.control?.markAsTouched();
    }
  }

  /**
   * Seleccionar una opción
   */
  selectOption(option: any): void {
    const value = option[this.valueKey];

    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.markAsTouched();

    this.selectionChange.emit(option);

    this.isOpen = false;
  }

  /**
   * Seleccionar opción por defecto
   */
  selectDefaultOption(): void {
    this.control.setValue('');
    this.control.markAsDirty();
    this.control.markAsTouched();

    this.selectionChange.emit(null);

    this.isOpen = false;
  }

  /**
   * Cerrar dropdown al hacer click fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest(`#${this.id}`)) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  }

  constructor(
    private cdr: ChangeDetectorRef
  ) {}
}