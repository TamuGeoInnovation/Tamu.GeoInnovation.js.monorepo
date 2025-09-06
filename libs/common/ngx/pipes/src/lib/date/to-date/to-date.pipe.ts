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

    const dates = Array.isArray(dateOrDates) ? dateOrDates : [dateOrDates];
    const result = dates.map((date) => this.convertToDate(date));
    return result.length === 1 ? result[0] : result;
  }

  private convertToDate(value: string | number | Date): Date | null {
    if (value instanceof Date) {
      return value;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
