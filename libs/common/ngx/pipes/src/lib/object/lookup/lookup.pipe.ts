import { Pipe, PipeTransform } from '@angular/core';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';

@Pipe({
  name: 'lookup'
})
export class LookupPipe<T> implements PipeTransform {
  /**
   * Returns the value of an object property given a valid dot-notation path.
   */
  public transform(
    value: Record<string, T> | string,
    secondary: string | Record<string, T>
  ): T | null | undefined {
    if (value === undefined || value === null) {
      return null;
    }

    // Two cases:
    // 1. value is a string and secondary is an object
    // 2. value is an object and secondary is a string
    if (typeof value === 'string' && typeof secondary === 'object') {
      return getPropertyValue(secondary, value);
    } else if (typeof value === 'object' && typeof secondary === 'string') {
      return getPropertyValue(value, secondary);
    }

    return null;
  }
}
