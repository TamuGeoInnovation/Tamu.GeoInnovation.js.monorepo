import { Pipe, PipeTransform } from '@angular/core';

import { Result } from '@tamu-gisc/ues/recycling/common/entities';

@Pipe({
  name: 'resultLookup'
})
export class ResultLookupPipe implements PipeTransform {
  /**
   * Accepts an array of sample results and a string representation of a location id (typically a tamu building number).
   *
   * This pipe finds within the results collection the object with matching tier and sample values, and returns
   * associated sampling value.
   */
  public transform(results: Array<Result>, locationId: string): unknown {
    const match = results.find((res) => {
      return `${res.location.id}` === locationId;
    });

    if (match) {
      return match.value;
    } else {
      return null;
    }
  }
}
