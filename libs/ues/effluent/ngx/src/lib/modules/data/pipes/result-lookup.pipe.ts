import { Pipe, PipeTransform } from '@angular/core';
import { Result } from '@tamu-gisc/ues/effluent/common/entities';

@Pipe({
  name: 'resultLookup'
})
export class ResultLookupPipe implements PipeTransform {
  /**
   * Accepts an array of sample results and a string representation of a tier and sample (e.g. 3-1, 3-2, etc).
   *
   * This pipe finds within the results collection the object with matching tier and sample values, and returns
   * associated sampling value.
   */
  public transform(results: Array<Result>, tierSampleString: string): unknown {
    const match = results.find((res) => {
      return `${res.location.tier}-${res.location.sample}` === tierSampleString;
    });

    if (match) {
      return match.value;
    } else {
      return null;
    }
  }
}
