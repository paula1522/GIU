import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Constantes } from './constants/Constantes';
import { NotificationMessageService } from '../shared/atomic-desing/molecule/notification-message/notification-message.service';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(   private msg: NotificationMessageService) { 

  }

  // Función que añade parámetros solo si tienen valores válidos
  static addParamsIfValid(
    params: HttpParams,
    key: string,
    value: string | number | boolean | null | undefined
  ): HttpParams {
    if (value !== null && value !== undefined && value !== '') {
      params = params.append(key, value.toString());
    }
    return params;
  }

  static addParamsObj(request: any): HttpParams {
    let params = new HttpParams();
    for (const key in request) {
      if (request.hasOwnProperty(key)) {
        const value = request[key];
        if (value !== null && value !== undefined && value.trim() != '') {
          // Append each key-value pair to HttpParams

          params = params.append(key, value.toString());
        }
      }
    }
    return params;
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result as string;
        // Quita: data:image/jpeg;base64,
        const base64 = result.split(',')[1];

        resolve(base64);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  //acepta  cualquier objeto e interfaz y devuelva un nuevo objeto con las propiedades especificadas
  //elobjeto ya debe estar creado
  static pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    return keys.reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Pick<T, K>);
  }

  // Método para convertir el número a un booleano
  static convertToBoolean(value: number): boolean {
    return value === 1; // Devuelve true si es 1, false si es 0
  }
  // Método para obtener los valores de una coleccion set como una cadena separada por comas
  static getSetString(set: Set<string>): string {
    // Convertir el Set a un Array y luego unir los elementos con comas
    return Array.from(set).join(', ');
  }

  /**
   *
   * @param form formulario que se va a evaluar
   */
  static markAllAsTouched(form: FormGroup) {
    form.markAllAsTouched();
  }

  /**
   * indica si el formulario de entrada, tiene como minimo un campo diligenciado
   * @param form formulario que se va a validar
   * @returns
   */
  static hasAtLeastOneFieldFilled(form: FormGroup): boolean {
    return Object.keys(form.controls).some((key) => {
      const control = form.get(key);
      return control && control.value !== null && control.value !== '';
    });
  }

  /**
   * Capitaliza los valores del JSON
   * primero los deja en minuscula y luego cada palabra la deja en mayuscula
   * @param obj
   * @returns
   */
  static capitalizeValues(obj: any): any {
    function capitalizeText(text: string): string {
      return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    //     /**
    //  * Este método capitaliza la primera letra de un texto dado.
    //  * @param text - El texto a capitalizar.
    //  */
    // capitalizeText(text: string): string {
    //   if (!text) return '';
    //   return text
    //     .toLowerCase()
    //     .split('. ')
    //     .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
    //     .join('. ');
    // }

    /**
   * Este metodo capitaliza la primera letra de cada oración en un texto dado.
   */
    //  capitalizarOraciones(texto: string): string {
    //   return texto
    //     .toLowerCase()
    //     .replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (match) => match.toUpperCase());
    // }


    // /**
    //  * Este método capitaliza la primera letra de cada palabra en un texto dado.
    //  * @param texto - El texto a capitalizar.
    //  * @returns El texto capitalizado.
    //  */
    // capitalizar(texto: string): string {
    //   return texto.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase());
    // }

    // Recorrer cada clave del objeto
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = capitalizeText(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.capitalizeValues(obj[key]);
      }
    }
    return obj;
  }

  // Función para capitalizar el inicio de cada palabra y convertir el resto a minúsculas
  static capitalizeWords(str: string): string {
    return str
      .toLowerCase() // Convertimos todo a minúsculas primero
      .split(' ') // Dividimos el texto en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizamos la primera letra de cada palabra
      .join(' '); // Unimos las palabras de nuevo en una cadena
  }

  static removeExtraBackslashes(value: string): string {
    return value.replace(/\\\\/g, '\\');
  }

  static escapeSpecialChars(value: string): string {
    if (!value) {
      return '';
    }

    // Reemplaza solo si el carácter especial no está precedido por un backslash
    return value.replace(/(?<!\\)([\\'"\/])/g, '\\$1');
  }

  /**
   * Metodo generico que filtra la lista de catalogos por el id de la categoria
   *
   * @param responseListas
   * @param categoryId
   * @returns
   */
  static filterListCat(responseListas: any, categoryId: string) {
    const data = (responseListas[categoryId] || [])
      .map((item: any) => {
        return {
          value: item.codigo,
          name: item.nombre?.toUpperCase(),
        };
      })
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    return data;
  }

  /**
   * Metodo mejorado que valida si al menos un campo del formulario esta diligenciado
   * @returns
   */
  static alMenosUnCampoLlenoValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const controls = (form as FormGroup).controls;
      const alMenosUnoLleno = Object.keys(controls).some((key) => {
        const control = controls[key];
        return control.value && control.enabled; // Excluye campos deshabilitados como tipoDocumento
      });
      return alMenosUnoLleno ? null : { alMenosUnCampo: true };
    };
  }

  /**
   * Lee un objeto File y lo convierte a una cadena Base64 pura.
   * @param file El objeto File a convertir.
   * @returns Una Promise que se resuelve con la cadena Base64 pura del archivo,
   * o se rechaza con un error si la lectura falla.
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Cuando la lectura sea exitosa
      reader.onload = () => {
        const base64DataUrl = reader.result as string;
        // Remueve el prefijo "data:mime/type;base64,"
        const base64String = base64DataUrl.split(',')[1];
        resolve(base64String); // Resuelve la Promise con la cadena Base64
      };

      // Si ocurre un error durante la lectura
      reader.onerror = (error) => {
        reject(error); // Rechaza la Promise con el error
      };

      // Inicia la lectura del archivo como Data URL (Base64)
      reader.readAsDataURL(file);
    });
  }

  /**
 * Para obtener la Data URL completa (con prefijo)
 */
  static fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }


  // Método para formatear fechas al formato yyyy-MM-dd'T'HH:mm:ss
  // amPm: 1 = inicio del día (00:00:00), 2 = fin del día (23:59:59)
  static formatDate(date: Date, amPm: number): string {
    if (date === null || date === undefined) {
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let hours = '00';
    let minutes = '00';
    let seconds = '00';

    if (amPm === 2) {
      hours = '23';
      minutes = '59';
      seconds = '59';
    }

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
  * Este metodo formatea cualquier fecha (YYYY-MM-DDTHH:MM:SS)
  */
  static formatDateYMD_MS(date: any) {
    const fecha = new Date(date);  // 👈 convertir a objeto Date

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${año}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
  }

  /**
   * Este metodo formatea cualquier texto a capitalizar
   */
  static capitalizar(texto: string | undefined | null): string {
    if (!texto || typeof texto !== 'string') {
      return '';
    }
    return texto.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
  }

  static formatDateCustome(fecha: string | number | Date): string {
    if (!fecha) return '';

    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return ''; // Fecha inválida

    const dia = dateObj.getDate().toString().padStart(2, '0');
    const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = dateObj.getFullYear();

    let horas = dateObj.getHours();
    const minutos = dateObj.getMinutes().toString().padStart(2, '0');
    const amPm = horas >= 12 ? 'pm' : 'am';

    horas = horas % 12;
    horas = horas ? horas : 12; // 0 se convierte en 12

    return `${dia}/${mes}/${anio} - ${horas}:${minutos} ${amPm}`;
  }

  static removeField<T extends object>(obj: T, key: string): Partial<T> {
    const { [key]: _, ...rest } = obj as Record<string, any>;
    return rest as Partial<T>;
  }

  static removeEmptyFieldsPlain<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) as Partial<T>;
  }

  // Metodo para validar una imagen

  processImage(
    event: Event,
    currentImages: number
  ): { file: File; preview: string } | null {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return null;
    }

    if (currentImages >= 1) {
      input.value = '';
      return null;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      input.value = '';
      return null;
    }

    const preview = URL.createObjectURL(file);

    input.value = '';

    return { file, preview };
  }

  mostrarModal(
    icon: string,
    title: string,
    comment?: string,
    onAccept?: () => void,
    onNotification?: () => void
  ): void {
    this.msg.openModal(
      {
        icon,
        title,
        comment,
        titleBtn1: 'Aceptar',
        closeOnBackdropClick: false
      },
      {
        btn1: () => {
          this.msg.closeModal();
          onAccept?.();
          onNotification?.();
        }
      }
    );
  }

  closeModal(): void {
    this.msg.closeModal();
  }

}


