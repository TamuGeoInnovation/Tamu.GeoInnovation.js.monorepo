import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exists'
})
export class ExistsPipe implements PipeTransform {
  /**
   * Pipe that checks if a value or object exists in a collection.
   *
   * @param {(Array<string | number | boolean>)} collection Collection to check if the matcher exists in.
   * @param {(string | number | boolean)} matcher Value to check if it exists in the collection.
   * @param {('some' | 'all')} [threshold] Optional threshold to check if all or some values match the matcher.
   * @return {*}  {boolean}
   * @memberof ExistsPipe
   */
  public transform(
    collection: Array<string | number | boolean>,
    matcher: string | number | boolean,
    threshold?: 'some' | 'all'
  ): boolean {
    if (collection && matcher) {
      if (threshold === 'all') {
        return collection.every((v) => v === matcher);
      }

      return collection.includes(matcher);
    }

    return false;
  }
}
