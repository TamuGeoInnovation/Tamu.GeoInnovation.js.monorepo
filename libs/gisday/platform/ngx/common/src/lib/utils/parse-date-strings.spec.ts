import { parseDateStrings } from './parse-date-strings';

describe('parseDateStrings', () => {
  it('joins an event day and a stored time', () => {
    const parsed = parseDateStrings('2026-11-20T06:00:00.000Z', '14:00:00 GMT-0600 (Central Standard Time)');

    expect(parsed.toISOString()).toBe('2026-11-20T20:00:00.000Z');
  });

  /**
   * #2710. A day arrives as midnight Central, which further west is still the day before; the session is on the
   * Central day, wherever the visitor is. Jest cannot change its time zone once started, so this is proven with
   * the whole run in another zone: `TZ=America/Los_Angeles npx jest ...` answered 2026-11-19 before the fix.
   */
  it('puts the session on the Central day', () => {
    const parsed = parseDateStrings('2026-11-20T06:00:00.000Z', '14:00:00 GMT-0600 (Central Standard Time)');

    expect(parsed.toISOString()).toBe('2026-11-20T20:00:00.000Z');
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
