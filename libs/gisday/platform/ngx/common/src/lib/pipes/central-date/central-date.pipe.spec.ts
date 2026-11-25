import { formatDate } from '@angular/common';

import { CentralDatePipe, centralOffset } from './central-date.pipe';

/**
 * #3552. West of Central, as for a visitor in El Paso or California, Angular's own `date` pipe with no zone moved GIS
 * Day's first day back to the evening before; `centralDate` formats in Central wherever it runs.
 */
describe('centralDate (#3552)', () => {
  const firstDay = '2026-11-16T06:00:00.000Z'; // midnight Central, as production stores a season day
  const pipe = new CentralDatePipe();
  // A browser's zone cannot be changed from inside a running Node, so the visitor's zone is given as the offset the old
  // pipe used there: what a Pacific visitor's browser rendered with `date` and no zone.
  it("is the point: formatted at a Pacific visitor's offset, as the old pipe was, the first day reads as the day before", () => {
    expect(formatDate(firstDay, 'MMMM d', 'en-US', '-0800')).toBe('November 15');
  });

  it('shows the day in Central time, wherever the visitor is', () => {
    expect(pipe.transform(firstDay, 'MMMM d')).toBe('November 16');
    expect(pipe.transform(firstDay, 'MMM. d')).toBe('Nov. 16');
  });

  it("shows a time at that instant's own Central offset, standard or daylight", () => {
    expect(pipe.transform('2026-11-16T15:30:00.000Z', 'h:mm a')).toBe('9:30 AM'); // CST, UTC-6
    expect(pipe.transform('2026-07-16T14:30:00.000Z', 'h:mm a')).toBe('9:30 AM'); // CDT, UTC-5
  });

  it('gives the offset Angular takes', () => {
    expect(centralOffset(new Date('2026-11-16T06:00:00.000Z'))).toBe('-0600');
    expect(centralOffset(new Date('2026-07-16T06:00:00.000Z'))).toBe('-0500');
  });

  it('answers null for nothing, or for a value that is not a date', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform('')).toBeNull();
    expect(pipe.transform('not a date')).toBeNull();
  });
});
