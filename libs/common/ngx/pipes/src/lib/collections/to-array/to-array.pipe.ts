import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {
  /**
   * Transforms a value or array of values into an array. If the input is null or undefined, an empty array is returned.
   *
   * If the input is already an array, it is returned as-is. For any other value, it is wrapped in a single-element array.
   */
  public transform<T>(value: T): Array<T>;
  public transform<T>(values: Array<T>): Array<T>;
  public transform<T>(valueOrValues: T | Array<T>): Array<T> {
    if (valueOrValues == null) {
      return [];
    }

    return Array.isArray(valueOrValues) ? valueOrValues : [valueOrValues];
  }
}
