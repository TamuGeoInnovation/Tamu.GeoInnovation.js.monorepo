import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nearestDate'
})
export class NearestDatePipe implements PipeTransform {
  public transform(dates: Array<Date | null>): Date | null {
    if (dates === undefined || dates === null || dates.length === 0) {
      return null;
    }

    const now = new Date();

    let nearestDate: Date | null = null;
    let smallestDiff: number = Number.MAX_SAFE_INTEGER;

    for (const date of dates) {
      if (!date) {
        continue;
      }
      const diff = Math.abs(date.getTime() - now.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestDate = date;
      }
    }

    return nearestDate;
  }
}
