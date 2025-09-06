import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to convert a date input (string, number, or Date) or an array of date inputs to Date object(s).
 * Returns null for invalid or empty inputs.
 */
@Pipe({
  name: 'toDate'
})
export class ToDatePipe implements PipeTransform {
  /**
   * Transforms the input into a Date object or an array of Date objects.
   * @param dateOrDates A single date input (string, number, or Date) or an array of such inputs.
   * @returns A Date object, an array of Date objects, or null if the input is invalid or empty.
   */
  public transform(date: string | number): Date | null;
  public transform(dates: Array<string | number | Date>): Array<Date | null>;
  public transform(dateOrDates: string | number | Date | Array<string | number | Date>): Date | Array<Date | null> | null {
    if (!dateOrDates) {
      return null;
    }

    // If input is an array, always return an array (even if it has one element)
    if (Array.isArray(dateOrDates)) {
      return dateOrDates.map((date) => this.convertToDate(date));
    }

    // If input is a single value, return a single Date (or null)
    return this.convertToDate(dateOrDates);
  }

  private convertToDate(value: string | number | Date): Date | null {
    if (value instanceof Date) {
      return value;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
