import { Pipe, PipeTransform } from '@angular/core';

/**
 * Calculates if a current page is at the start or end of a pagination sequence.
 */
@Pipe({
  name: 'isLimit'
})
export class IsLimitPipe implements PipeTransform {
  public transform(currentPage: number, pageSize: number, totalItems: number, direction: 'start' | 'end'): boolean | null {
    if (!currentPage || !pageSize || !totalItems || !direction) {
      return null;
    }

    if (direction === 'start') {
      return currentPage === 1;
    } else if (direction === 'end') {
      return currentPage === Math.ceil(totalItems / pageSize);
    }

    return null;
  }
}
