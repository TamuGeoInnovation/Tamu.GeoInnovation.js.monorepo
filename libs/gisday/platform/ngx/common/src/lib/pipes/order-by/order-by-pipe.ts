import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {
  /**
   * Orders a collection by a key and direction.
   *
   * @param collection Item collection to sort.
   * @param path Dot-notation location in each object in which comparison value is found.
   * @param direction Defaults to `asc`.
   */
  public transform<T extends object>(collection: Array<T>, path: string, direction?: 'asc' | 'desc'): Array<T> {
    // Return early if no collection
    if (collection && collection.length > 0) {
      const sorted = collection.sort((first, second) => {
        const firstValue: number | string = first[path];
        const secondValue: number | string = second[path];

        if (firstValue === undefined || secondValue === undefined) {
          return 0;
        }

        if (typeof firstValue === 'string' && typeof secondValue === 'string') {
          if (direction === 'asc') {
            return (firstValue as string).localeCompare(secondValue);
          } else if (direction === 'desc') {
            return (secondValue as string).localeCompare(firstValue);
          } else {
            throw new Error('Invalid ordering direction specified');
          }
        }
      });

      return sorted;
    } else {
      return collection;
    }
  }
}
