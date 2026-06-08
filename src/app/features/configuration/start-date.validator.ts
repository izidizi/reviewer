import { AbstractControl, ValidationErrors } from '@angular/forms';

export function startDateValidator(control: AbstractControl): ValidationErrors | null {
  const validDate = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/i.test(control.value);
  return validDate === false ? { invalidDate: { value: control.value } } : null;
}
