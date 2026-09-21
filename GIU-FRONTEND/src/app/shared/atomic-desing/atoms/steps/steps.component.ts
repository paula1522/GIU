import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { stepsModel } from './steps.interface';


@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent {
  indexCurrentStep: number = -1;
  @Input() listSteps: stepsModel[] = [];
  @Output() stepCurrent = new EventEmitter<any>(); // devuelve el index del paso actual

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.completListSteps();
  }

  completListSteps() {
    this.listSteps.map((item, i) => {
      item.check = false;
      if (item.active) {
        this.indexCurrentStep = i;
      }
    });
  }

  next() {
    this.listSteps.forEach((item, i) => {
      if (item.active) {
        this.indexCurrentStep = i;
        return;
      }
    });
    if ((this.indexCurrentStep + 1) < this.listSteps.length) {
      this.listSteps[this.indexCurrentStep].active = false;
      this.listSteps[this.indexCurrentStep].check = true;
      this.listSteps[this.indexCurrentStep + 1].active = true;
      this.indexCurrentStep = this.indexCurrentStep + 1;
    } else {
      this.listSteps[this.indexCurrentStep].check = true;
    }
    this.stepCurrent.emit(this.indexCurrentStep);
  }

  previous(indexPrevious: number) {
    let indexCurrent = 0;
    this.listSteps.forEach((item, i) => {
      if (item.active) {
        indexCurrent = i;
        return;
      }
    });
    if ((indexPrevious + 1) < (indexCurrent + 1)
      && (indexPrevious + 1) < this.listSteps.length
      && (indexCurrent + 1) > 1
      && (indexCurrent + 1) < this.listSteps.length
    ) {
      this.listSteps[indexPrevious].active = true;
      this.listSteps[indexPrevious].check = false;
      this.listSteps[indexCurrent].active = false;
      this.indexCurrentStep = indexPrevious;
    }
    this.stepCurrent.emit(this.indexCurrentStep);
  }

  end() {
    this.listSteps.forEach((item, i) => {
      item.check = false;
      if (i === 0) {
        item.active = true;
      } else {
        item.active = false;
      }
    });
    this.indexCurrentStep = 0;
    this.stepCurrent.emit(this.indexCurrentStep);
  }
}
