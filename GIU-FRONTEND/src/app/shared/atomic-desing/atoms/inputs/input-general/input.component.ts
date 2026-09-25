import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Constantes } from '../../../../../utils/constants/Constantes';

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush // 🔥 IMPORTANTE
})
export class InputComponent implements OnInit {

  @Input() textLabel = '';
  @Input() isTextArea: boolean = false;
  @Input() srcImgRight?: string;
  @Input() srcImgLeft?: string;
  @Input() placeholder?: string;
  @Input() type = 'text';
  @Input() form?: FormGroup;
  @Input() controlName?: string;
  @Input() validationMessages: Record<string, { type: string; message: string }[]> = {};
  @Input() showEyeIcon = false;
  @Input() widthInput = '100%';
  @Input() showRequiredMark = true;

  @Input() ngModelValue: any;

  control!: FormControl;
  showPassword = false;
  filteredMessages: { type: string; message: string }[] = [];
  isInvalid = false;
  iconeye = Constantes.PATH_ICON_EYE_INPUT;
  iconEyeSlash = Constantes.PATH_ICON_EYE_SLASH_INPUT;

  ngOnInit(): void {
    this.initControl();
    this.initMessages();
    this.initLabel();
  }

  private initControl(): void {
    if (this.form && this.controlName) {
      this.control = this.form.get(this.controlName) as FormControl;
    }
  }

  private initMessages(): void {
    if (this.controlName && this.validationMessages[this.controlName]) {
      this.filteredMessages = this.validationMessages[this.controlName];
    }
  }

  private initLabel(): void {
    if (!this.placeholder) {
      this.placeholder = this.textLabel;
    }

    if (this.control && this.showRequiredMark && this.control.hasValidator(Validators.required)) {
      this.textLabel = `* ${this.textLabel}`;
    }
  }

  hasError(type: string): boolean {
    return !!this.control?.hasError(type) && (this.control.dirty || this.control.touched);
  }

  get controlInvalid(): boolean {
    return !!this.control?.invalid && this.control?.touched;
  }

  /** True si hay un textLabel definido (para ocultar el placeholder cuando hay floating label). */
  get hasLabel(): boolean {
    return !!this.textLabel;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}