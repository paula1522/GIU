import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe, NgFor, NgIf , CommonModule} from '@angular/common';
import { EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../../atoms/button/button.component';

/**
 * @autor   
 * 
 * @description 
 */

@Component({
  selector: 'notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
})
export class NotificationMessageComponent implements OnInit {

  @Input() icon?: string ; 
  @Input() title?: string; 
  @Input() titleBtn1?: string;
  @Input() titleBtn2?: string;
  @Input() comment?: string;
  @Input() closeOnBackdropClick : boolean = true;
  @Input() loading : boolean = false;
  @Input() image ?: string;
  @Input() commentLoading ?: string;
  @Input() showProgress: boolean = false;
@Input() progress: number = 0;
  @Output() clickEventButton1 = new EventEmitter<any>(); 
  @Output() clickEventButton2 = new EventEmitter<any>(); 
  @Output() _backClicEvent = new EventEmitter<any>(); // Salida que emite un evento al hacer clic en el botón
  
  @ViewChild('componentModal') componentModal!: ModalComponent;
 

  isModalReady: boolean = false;

  constructor() { }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.componentModal) {
      this.isModalReady = true;
    } else {
      console.error(" Error: componentModal no se inicializó correctamente.");
    }
  }
  

  /**
   * eventButton - Método que se ejecuta cuando se hace clic en el botón.
   * 
   * Emite un evento al componente padre 
   */
  eventClickEventButton1() {
    this.clickEventButton1.emit(); // Emite el evento para que el padre lo capture
  }

  eventClickEventButton2() {
    this.clickEventButton2.emit(); // Emite el evento para que el padre lo capture
  }

  /**
   * open - Método que abre el modal.
   */
   open() {
    if (this.isModalReady) {
      this.componentModal.open();
    } else {
      setTimeout(() => {
        if (this.componentModal) {
          this.componentModal.open();
        }
      }, 0);
    }
  }

  /**
   * close - Método que cierra el modal y emite el evento de cierre.
   */
   close() {
    setTimeout(() => {
      if (this.componentModal) {
        this.componentModal.close();
      } else {
        console.warn(" Intento de cerrar un modal antes de que se inicialice.");
      }
    }, 0);
  }
  
  

  backClicEvent(){

    this._backClicEvent.emit();
  }

}
