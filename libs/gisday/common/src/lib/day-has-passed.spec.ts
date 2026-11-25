import { dayHasPassed } from './gisday-common';

/**
 * #3221. The Sessions page collapses the days that have passed. A day is its calendar date in Central time, and it
 * arrives as midnight Central: 06:00 UTC in November.
 */
describe('dayHasPassed()', () => {
  const monday = '2026-11-16T06:00:00.000Z';

  it('is false on the day itself, all day in Central time', () => {
    expect(dayHasPassed(monday, new Date('2026-11-16T06:00:00Z'))).toBe(false);
    // 11:59 PM Central on Monday, which is already Tuesday in UTC.
    expect(dayHasPassed(monday, new Date('2026-11-17T05:59:00Z'))).toBe(false);
  });

  it('is true from midnight Central the next day', () => {
    expect(dayHasPassed(monday, new Date('2026-11-17T06:00:00Z'))).toBe(true);
  });

  it('is false for a day still to come', () => {
    expect(dayHasPassed(monday, new Date('2026-11-15T18:00:00Z'))).toBe(false);
  });

  it('is true for a day of an earlier year, and false for one that is missing or cannot be read', () => {
    expect(dayHasPassed('2025-11-17T06:00:00.000Z', new Date('2026-01-01T18:00:00Z'))).toBe(true);
    expect(dayHasPassed(undefined, new Date())).toBe(false);
    expect(dayHasPassed('not a date', new Date())).toBe(false);
  });
});
