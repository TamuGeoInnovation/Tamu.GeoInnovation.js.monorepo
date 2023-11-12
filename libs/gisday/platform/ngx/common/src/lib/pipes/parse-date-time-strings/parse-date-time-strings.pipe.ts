import { Pipe, PipeTransform } from '@angular/core';

import { parseDateStrings } from '../../utils/parse-date-strings';

/**
 * Accepts a date string (date.toDateString()) and a time string (date.toTimeString())
 * and returns a Date object with the date and time set to the values of the input strings.
 *
 * This is useful for event dates and times which are stored as separate columns in the database.
 *
 * @export
 * @class ParseDateTimeStringsPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'parseDateTimeStrings'
})
export class ParseDateTimeStringsPipe implements PipeTransform {
  public transform(dateString: string | Date, timeString: string): Date {
    return parseDateStrings(dateString, timeString);
  }
}
