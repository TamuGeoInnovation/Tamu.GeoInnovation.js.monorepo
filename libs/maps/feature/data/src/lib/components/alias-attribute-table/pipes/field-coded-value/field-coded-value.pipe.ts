import { Pipe, PipeTransform } from '@angular/core';

import esri = __esri;

/**
 * Accepts a field object and a coded value and returns the named (user-friendly)
 * value from the field domain.
 */
@Pipe({
  name: 'fieldCodedValue'
})
export class FieldCodedValuePipe implements PipeTransform {
  public transform(field: esri.Field, codedValue: string | number): string | number {
    if (!field || !field.domain) {
      return codedValue;
    }

    if (field.domain.type !== 'coded-value') {
      console.warn(`Unsupported field domain for field: ${field.name}`);

      return codedValue;
    }

    const namedValue = (field.domain as esri.CodedValueDomain).getName(codedValue);

    return namedValue;
  }
}
