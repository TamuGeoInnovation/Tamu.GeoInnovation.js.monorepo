import { dateForDateTimeString } from './common-utils-date';

describe('dateForTimeString', () => {
  it('should return valid dates for valid AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(2, 0, 0, 0);
    expect(dateForDateTimeString("02:00 AM").toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(22, 0, 0, 0);
    expect(dateForDateTimeString("10:00 PM").toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid approx. AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(7, 0, 0, 0);
    expect(dateForDateTimeString("~07:00 AM").toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid dates for valid approx. PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(17, 0, 0, 0);
    expect(dateForDateTimeString("~05:00 PM").toTimeString()).toBe(today.toTimeString());
  });

  it('should handle 12:00 as noon', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(12, 0, 0, 0);
    expect(dateForDateTimeString("12:00").toTimeString()).toBe(today.toTimeString());
  });

  it('should return valid AM dates for strings without AM/PM', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(11, 0, 0, 0);
    expect(dateForDateTimeString("11:00").toTimeString()).toBe(today.toTimeString());
  });

  it('should return error for invalid string', () => {
    expect(dateForDateTimeString("jonlovestesting").toTimeString()).toBe('Invalid Date');
  });

  it('should return error for empty string', () => {
    expect(dateForDateTimeString("").toTimeString()).toBe('Invalid Date');
  });

  it('should return null for null string', () => {
    expect(() => dateForDateTimeString(null).toTimeString()).toThrow(new TypeError("Cannot read property 'startsWith' of null"));
  });
});
