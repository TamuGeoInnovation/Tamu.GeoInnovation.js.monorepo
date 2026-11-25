import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { centralOffsetMs } from '@tamu-gisc/gisday/common';

/** `centralOffsetMs` as the `+hhmm`/`-hhmm` Angular's `formatDate` takes: `-0600` in standard time, `-0500` in daylight. */
export function centralOffset(date: Date): string {
  const minutes = Math.round(centralOffsetMs(date) / 60000);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);

  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}${String(abs % 60).padStart(2, '0')}`;
}

/**
 * Angular's `date` pipe in US Central time, where GIS Day is (#3552): the same format strings (`'MMMM d'`, `'h:mm a'`,
 * `'short'`), formatted at that instant's own Central offset, CST or CDT.
 *
 * `date` with no zone formats in the visitor's zone. GIS Day's days are stored as midnight Central, which is the
 * previous evening anywhere west of it, so the About page told a visitor in El Paso or California that GIS Day ran
 * 15 to 19 November when it ran 16 to 20. A fixed `'-0600'` was the other workaround in these templates, and is an
 * hour off for a date in daylight time.
 *
 * @example {{ day.date | centralDate : 'MMMM d' }}
 */
@Pipe({ name: 'centralDate' })
export class CentralDatePipe implements PipeTransform {
  public transform(value: Date | string | number | null | undefined, format = 'mediumDate'): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    return formatDate(date, format, 'en-US', centralOffset(date));
  }
}
