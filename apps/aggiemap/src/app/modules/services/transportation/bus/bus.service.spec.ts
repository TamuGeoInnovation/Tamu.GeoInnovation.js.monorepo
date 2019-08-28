import { BusService } from './bus.service';

describe('BusService', () => {
  it('#dateForTimeString should return valid dates for valid AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(2, 0, 0, 0);
    expect(BusService.dateForTimeString("02:00 AM").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should return valid dates for valid PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(22, 0, 0, 0);
    expect(BusService.dateForTimeString("10:00 PM").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should return valid dates for valid approx. AM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(7, 0, 0, 0);
    expect(BusService.dateForTimeString("~07:00 AM").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should return valid dates for valid approx. PM strings', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(17, 0, 0, 0);
    expect(BusService.dateForTimeString("~05:00 PM").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should handle 12:00 as noon', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(12, 0, 0, 0);
    expect(BusService.dateForTimeString("12:00").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should return valid AM dates for strings without AM/PM', () => {
    const today = new Date(); // dateForTimeString dates are always today, only times change
    today.setHours(11, 0, 0, 0);
    expect(BusService.dateForTimeString("11:00").toTimeString()).toBe(today.toTimeString());
  });

  it('#dateForTimeString should return error for invalid string', () => {
    expect(BusService.dateForTimeString("jonlovestesting").toTimeString()).toBe('Invalid Date');
  });

  it('#dateForTimeString should return error for empty string', () => {
    expect(BusService.dateForTimeString("").toTimeString()).toBe('Invalid Date');
  });

  it('#dateForTimeString should return null for null string', () => {
    expect(() => BusService.dateForTimeString(null).toTimeString()).toThrow(new TypeError("Cannot read property 'startsWith' of null"));
  });
});
