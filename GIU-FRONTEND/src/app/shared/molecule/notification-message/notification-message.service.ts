import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { NotificationMessageComponent } from './notification-message.component';
import { Subscription, Subject } from 'rxjs';
import { Constantes } from '../../../utils/constants/Constantes';

interface ModalOptions {
  icon?: string;
  title?: string;
  titleBtn1?: string;
  titleBtn2?: string;
  comment?: string;
  closeOnBackdropClick?: boolean;
  loading?: boolean;
  image?: string;
  commentLoading?: string;

  showProgress?: boolean;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationMessageService {
  private progressInterval: any = null;
  private modalComponentRef: any;
  private buttonClickSubscription: Subscription | null = null;
  public cancelRequest$ = new Subject<void>();
  constructor(
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  openModal(options: ModalOptions = {}
    , buttonCallbacks: { btn1?: () => void, btn2?: () => void } = {} // Callback para el evento de click en botones
    , loading?: boolean
  ) {
    // Si el modal ya está abierto, no se crea otro
    if (this.modalComponentRef) {
      // se configuran los valores de entrada del componente
      this.setInstanceOptions(options);
      // Vincula los eventos de los botones
      this.bindButtonEvents(buttonCallbacks);

      this.modalComponentRef.instance.open();
      return;
    }
    // Crea una instancia del componente personalizado
    const factory = this.resolver.resolveComponentFactory(NotificationMessageComponent);
    const modalFactory = factory.create(this.injector);
    this.modalComponentRef = modalFactory;
    // se configuran los valores de entrada del componente
    this.setInstanceOptions(options);
    // Vincula los eventos de los botones
    this.bindButtonEvents(buttonCallbacks);
    // Agrega la instancia del componente al DOM
    this.appRef.attachView(this.modalComponentRef.hostView);
    // se agrega al cuerpo del documento
    document.body.appendChild(this.modalComponentRef.location.nativeElement);
    this.modalComponentRef.instance.open();
  }

  closeModal() {
    this.stopProgress();

    if (!this.modalComponentRef) {
      return;
    }

    if (this.buttonClickSubscription) {
      this.buttonClickSubscription.unsubscribe();
      this.buttonClickSubscription = null;
    }

    if (this.modalComponentRef.instance) {
      this.modalComponentRef.instance.close();  // Asegura que instance no es undefined
    }

    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();
    this.modalComponentRef = null;
  }


  private bindButtonEvents(buttonCallbacks: { btn1?: () => void, btn2?: () => void }) {
    if (buttonCallbacks.btn1) {
      this.buttonClickSubscription = this.modalComponentRef.instance.clickEventButton1.subscribe(() => {
        buttonCallbacks.btn1?.();
      });
    }

    if (buttonCallbacks.btn2) {
      const btn2Subscription = this.modalComponentRef.instance.clickEventButton2.subscribe(() => {
        buttonCallbacks.btn2?.();

        this.buttonClickSubscription = this.buttonClickSubscription
          ? new Subscription(() => {
            this.buttonClickSubscription?.unsubscribe();
            btn2Subscription.unsubscribe();
          })
          : btn2Subscription;
      });
    }


  }

  private setInstanceOptions(options: ModalOptions) {
    this.modalComponentRef.instance.image = options.image;
    this.modalComponentRef.instance.loading = options.loading;
    this.modalComponentRef.instance.icon = options.icon;
    this.modalComponentRef.instance.icon = options.icon;
    this.modalComponentRef.instance.title = options.title;
    this.modalComponentRef.instance.titleBtn1 = options.titleBtn1;
    this.modalComponentRef.instance.titleBtn2 = options.titleBtn2;
    this.modalComponentRef.instance.comment = options.comment;
    this.modalComponentRef.instance.commentLoading = options.commentLoading;
    this.modalComponentRef.instance.closeOnBackdropClick = options.closeOnBackdropClick !== undefined ? options.closeOnBackdropClick : true;

    this.modalComponentRef.instance.showProgress =
      options.showProgress ?? false;

    this.modalComponentRef.instance.progress =
      options.progress ?? 0;

    this.modalComponentRef.instance.closeOnBackdropClick =
      options.closeOnBackdropClick !== undefined
        ? options.closeOnBackdropClick
        : true;
  }

  notificationMessageBasic(title: string, comment: string,) {
    this.openModal({
      title: title,
      comment: comment,
      titleBtn1: "Aceptar",
      loading: false
    }, {
      btn1: () => {
        this.closeModal();
      }
    });
  }

  loading(
    title?: string,
    commentLoading?: string,
    allowUnsubscribe: boolean = false
  ) {

    const openLoadingModal = () => {
      this.openModal(
        {
          title: title || '',
          commentLoading: commentLoading || '',
          titleBtn1: allowUnsubscribe ? 'Cancelar' : '',
          loading: true,
          closeOnBackdropClick: false
        },
        allowUnsubscribe
          ? {
            btn1: () => {
              // abrir confirmación SIN perder contexto
              this.openConfirmCancel(openLoadingModal);
            }
          }
          : {}
      );
    };

    openLoadingModal();
  }

  private openConfirmCancel(reopenLoading: () => void) {
    this.openModal(
      {
        title: '¿Deseas cancelar?',
        comment: 'Se cancelará la petición en curso',
        titleBtn1: 'Sí',
        titleBtn2: 'No'
      },
      {
        btn1: () => {
          this.cancelRequest();
          this.closeModal();
        },
        btn2: () => {
          this.closeModal();

          //  volver al loading
          setTimeout(() => {
            reopenLoading();
          }, 0);
        }
      }
    );
  }

  cancelRequest() {
    this.cancelRequest$.next();
  }

  loadingProgress(
    title: string,
    commentLoading: string
  ): void {

    this.stopProgress();

    this.openModal({
      title,
      commentLoading,
      loading: true,
      showProgress: true,
      progress: 0,
      closeOnBackdropClick: false
    });
  }

  private stopProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  updateProgress(progress: number): void {

    if (!this.modalComponentRef?.instance) {
      return;
    }

    this.modalComponentRef.instance.progress =
      Math.min(progress, 95);
  }
}

