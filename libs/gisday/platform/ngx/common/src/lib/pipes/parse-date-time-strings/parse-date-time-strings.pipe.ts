import { Pipe, PipeTransform } from '@angular/core';

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
    if (!dateString || !timeString) {
      return null;
    }

    // A date string can be a partial date string, e.g. "Mon Nov 09 2020" or a full date string, e.g. "Mon Nov 09 2020 00:00:00 GMT-0600 (Central Standard Time)"
    // We can get the date string from the parsed date object, but we need to parse the time string manually.
    const dateFromDateString = dateString instanceof Date ? dateString.toDateString() : new Date(dateString).toDateString();

    // A qualified date string is a composite of a date string and a time string, separated by a space.
    // Knowing this, we can parse a new date using the two values.
    const qualifiedDateString = `${dateFromDateString} ${timeString}`;

    const parsedDateTime = new Date(qualifiedDateString);

    return parsedDateTime;
  }
}

