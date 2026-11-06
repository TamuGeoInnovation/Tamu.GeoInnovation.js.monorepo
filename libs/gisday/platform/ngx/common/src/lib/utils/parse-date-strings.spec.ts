import { parseDateStrings } from './parse-date-strings';

describe('parseDateStrings', () => {
  it('joins an event day and a stored time', () => {
    const parsed = parseDateStrings('2026-11-20T06:00:00.000Z', '14:00:00 GMT-0600 (Central Standard Time)');

    expect(parsed.toISOString()).toBe('2026-11-20T20:00:00.000Z');
  });

  /**
   * #2710. A day arrives as midnight Central, which further west is still the day before; the session is on the
   * Central day, wherever the visitor is.
   */
  it.each(['America/Los_Angeles', 'America/New_York', 'Asia/Tokyo', 'UTC'])('is the same instant in %s', (zone) => {
    const was = process.env.TZ;
    process.env.TZ = zone;

    try {
      const parsed = parseDateStrings('2026-11-20T06:00:00.000Z', '14:00:00 GMT-0600 (Central Standard Time)');

      expect(parsed.toISOString()).toBe('2026-11-20T20:00:00.000Z');
    } finally {
      process.env.TZ = was;
    }
  });

  it('answers null for a missing day or time', () => {
    expect(parseDateStrings(null, '14:00:00 GMT-0600 (Central Standard Time)')).toBeNull();
    expect(parseDateStrings('2026-11-20T06:00:00.000Z', null)).toBeNull();
  });

  /**
   * Regression coverage (#1772). A start time stored as "Invalid Date" came back as an invalid Date,
   * and Angular's date pipe threw on it, which took the Sessions page down for everyone.
   */
  it('answers null, not an invalid Date, for a stored time that cannot be read', () => {
    expect(parseDateStrings('2026-11-20T06:00:00.000Z', 'Invalid Date')).toBeNull();
  });
});
