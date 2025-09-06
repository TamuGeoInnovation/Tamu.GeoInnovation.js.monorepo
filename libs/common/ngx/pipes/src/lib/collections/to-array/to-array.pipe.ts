import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {
  public transform<T>(value: T): Array<T>;
  public transform<T>(value: Array<T>): Array<T>;
  public transform<T>(value: T | Array<T>): Array<T> {
    if (value == null) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }
}
