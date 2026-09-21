import { Component, EventEmitter, Input, Output  } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  @Input() textLabel = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Input() id = 'app-checkbox';
  @Input() form?: FormGroup;
  @Input() controlName?: string;
  @Output() checkedChange = new EventEmitter<boolean>();
  control!: FormControl;

  
  ngOnInit(): void {
    this.initControl();

  }


  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    this.checked = input.checked;
  
    if (this.control) {
      this.control.setValue(input.checked);
      this.control.markAsTouched();
      this.control.markAsDirty();
    }
  
    this.checkedChange.emit(this.checked);
  }

  private initControl(): void {
    if (this.form && this.controlName) {

      this.control = this.form.get(this.controlName) as FormControl;

      if (this.control) {

        // Inicializar estado visual
        this.checked = this.control.value ?? false;

        // Escuchar cambios realizados desde el FormGroup
        this.control.valueChanges.subscribe(value => {
          this.checked = value ?? false;
        });
      }
    }
  }

 

  hasError(type: string): boolean {
    return !!this.control?.hasError(type) && (this.control.dirty || this.control.touched);
  }

  get controlInvalid(): boolean {
    return !!this.control?.invalid && this.control?.touched;
  }



}
