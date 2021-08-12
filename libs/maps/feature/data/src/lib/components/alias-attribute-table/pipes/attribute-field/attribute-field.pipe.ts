import { Pipe, PipeTransform } from '@angular/core';

import esri = __esri;

/**
 * Matches an attribute key (feature attribute) to a field objet and returns it.
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
