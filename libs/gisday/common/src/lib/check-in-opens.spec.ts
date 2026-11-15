import { checkInOpensMessage } from './gisday-common';

/**
 * #3077. A QR code scanned before its session showed only "Checkin will be available at the start of the session",
 * so the attendee could not tell when to scan again. The page now names the time, in Central wherever they are.
 */
describe('checkInOpensMessage', () => {
  // 2:00 PM Central on 18 November 2026 (CST, UTC-6).
  const opens = new Date('2026-11-18T20:00:00Z');

  it('gives only the time on the same Central day', () => {
    expect(checkInOpensMessage(opens, new Date('2026-11-18T15:00:00Z'))).toBe('Check-in opens at 2:00 PM.');
  });

  it('gives the day as well on another day', () => {
    expect(checkInOpensMessage(opens, new Date('2026-11-17T15:00:00Z'))).toBe(
      'Check-in opens on Wednesday, November 18 at 2:00 PM.'
    );
  });

  it('counts the day in Central, not UTC', () => {
    // 11:30 PM Central on the 17th is already the 18th in UTC.
    expect(checkInOpensMessage(opens, new Date('2026-11-18T05:30:00Z'))).toBe(
      'Check-in opens on Wednesday, November 18 at 2:00 PM.'
    );
  });
});
