import { Pipe, PipeTransform } from '@angular/core';

import esri = __esri;

/**
 * Matches an attribute key (name) to a field object and returns the matched value.
 */
@Pipe({
  name: 'attributeField'
})
export class AttributeFieldPipe implements PipeTransform {
  public transform(field: string, fields: Array<esri.Field>): esri.Field {
    const match = fields.find((f) => f.name === field);

    return match;
  }
}
