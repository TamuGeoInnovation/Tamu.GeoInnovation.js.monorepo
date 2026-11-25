import { dateForDateTimeString, timeStringForDate } from './common-utils-date';

describe('dateForTimeString', () => {
  it('should return valid dates for valid AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(2, 0, 0, 0);
    expect(dateForDateTimeString('02:00 AM').toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(22, 0, 0, 0);
    expect(dateForDateTimeString('10:00 PM').toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid approx. AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(7, 0, 0, 0);
    expect(dateForDateTimeString('~07:00 AM').toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid approx. PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(17, 0, 0, 0);
    expect(dateForDateTimeString('~05:00 PM').toTimeString()).toBe(today.toTimeString());
  });

  it('should handle 12:00 as noon', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(12, 0, 0, 0);
    expect(dateForDateTimeString('12:00').toTimeString()).toBe(today.toTimeString());
  });

  // 12 AM is the hour after midnight; it was read as noon, so a bus time just after midnight landed at midday (#3464).
  it.each([
    ['12:05 AM', 0, 5],
    ['~12:05 AM', 0, 5],
    ['12:05 PM', 12, 5]
  ])('should read %s as %i:%i', (time, hours, minutes) => {
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    expect(dateForDateTimeString(time).toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid AM dates for strings without AM/PM', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(11, 0, 0, 0);
    expect(dateForDateTimeString('11:00').toTimeString()).toBe(today.toTimeString());
  });

  it('should return error for invalid string', () => {
    expect(dateForDateTimeString('jonlovestesting').toTimeString()).toBe('Invalid Date');
  });

  it('should return error for empty string', () => {
    expect(dateForDateTimeString('').toTimeString()).toBe('Invalid Date');
  });

  // Asserts the error TYPE rather than V8's message text. The original asserted
  // "Cannot read property 'startsWith' of null", which was V8's wording up to Node 14;
  // Node 16 onwards phrases it "Cannot read properties of null (reading 'startsWith')".
  // Pinning a test to an engine's error string breaks on every runtime upgrade.
  it('should throw for a null string', () => {
    expect(() => dateForDateTimeString(null).toTimeString()).toThrow(TypeError);
  });
});

describe('timeStringForDate', () => {
  it('should handle AM times', () => {
    const today = new Date();
    today.setHours(2, 0, 0, 0);
    expect(timeStringForDate(today)).toEqual('02:00 AM');
  });

  it('should handle PM times', () => {
    const today = new Date();
    today.setHours(16, 0, 0, 0);
    expect(timeStringForDate(today)).toEqual('04:00 PM');
  });

  // Noon was read as 12 AM and the hour after midnight as 00 AM, so a trip's step at noon said AM (#2643).
  it.each([
    [0, 5, '12:05 AM'],
    [11, 59, '11:59 AM'],
    [12, 0, '12:00 PM'],
    [12, 30, '12:30 PM'],
    [13, 0, '01:00 PM'],
    [23, 59, '11:59 PM']
  ])('should read %i:%i as %s', (hours, minutes, expected) => {
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    expect(timeStringForDate(today)).toEqual(expected);
  });
});
