import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator personalizado que valida que al menos un control de un FormArray
 * tenga el valor `true`.
 *
 * @returns ValidationErrors | null — Retorna `{ minSelected: true }` si no hay
 *          ningún control con valor `true`, o `null` si la validación pasa.
 */
export function minSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !Array.isArray(control.value)) {
      return { minSelected: true };
    }
    const hasAtLeastOne = control.value.some((v: boolean) => v === true);
    return hasAtLeastOne ? null : { minSelected: true };
  };
}
