import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss'
})
export class RadioComponent {

  @Input() textLabel = '';
  @Input() id = 'app-radio';
  @Input() name = 'app-radio';
  @Input() value = '';
  @Input() disabled = false;

  @Input() form?: FormGroup;
  @Input() controlName?: string;

  control!: FormControl;

  ngOnInit(): void {
    this.initControl();
  }

  private initControl(): void {
    if (this.form && this.controlName) {
      this.control = this.form.get(this.controlName) as FormControl;
    }
  }

  get isChecked(): boolean {
    return this.control?.value === this.value;
  }

  onChange(): void {
    if (this.control) {
      this.control.setValue(this.value);
      this.control.markAsTouched();
      this.control.markAsDirty();
    }
  }
}