import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeUntil'
})
export class TimeUntilPipe implements PipeTransform {
  public transform(value: number): string {
    const minutes = value;

    if (minutes < 60) {
      return `${value.toFixed(0)} min`;
    } else {
      const hours = (value / 60).toFixed(0);

      const partialHour = (((value % 60) % 1) * 60).toFixed(0);

      return `${hours}:${partialHour.length < 2 ? '0' + partialHour : partialHour} hr`;
    }
  }
}
