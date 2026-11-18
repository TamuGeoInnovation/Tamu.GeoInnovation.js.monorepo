import { checkInMinutesProblem, checkInOpensRelative, checkInWindow, isCheckInOpen } from './gisday-common';

/**
 * #3209. Check-in opened at a session's start and closed 15 minutes after its end, for every session. It now opens 5
 * minutes before and closes 10 minutes after by default, and each session can set its own.
 */
describe('a session check-in window', () => {
  // Wednesday 18 November 2026, 4:00 to 5:00 PM Central, as the admin form stores them.
  const day = new Date('2026-11-18T06:00:00Z');
  const start = '16:00:00 GMT-0600 (Central Standard Time)';
  const end = '17:00:00 GMT-0600 (Central Standard Time)';

  it('opens 5 minutes before the start and closes 10 minutes after the end by default', () => {
    expect(checkInWindow(day, start, end)).toEqual({
      opens: new Date('2026-11-18T21:55:00Z'),
      closes: new Date('2026-11-18T23:10:00Z')
    });
  });

  it("takes the session's own minutes", () => {
    expect(checkInWindow(day, start, end, { checkInMinutesBefore: 0, checkInMinutesAfter: 30 })).toEqual({
      opens: new Date('2026-11-18T22:00:00Z'),
      closes: new Date('2026-11-18T23:30:00Z')
    });
  });

  it('reads minutes held as text, as a number box gives them', () => {
    expect(checkInWindow(day, start, end, { checkInMinutesBefore: '15', checkInMinutesAfter: '0' })).toEqual({
      opens: new Date('2026-11-18T21:45:00Z'),
      closes: new Date('2026-11-18T23:00:00Z')
    });
  });

  it.each([null, undefined, -5, 2.5, 'soon', 1441])('takes the default for a setting of %p', (bad) => {
    expect(checkInWindow(day, start, end, { checkInMinutesBefore: bad, checkInMinutesAfter: bad })).toEqual({
      opens: new Date('2026-11-18T21:55:00Z'),
      closes: new Date('2026-11-18T23:10:00Z')
    });
  });

  it('is open inside the window and closed outside it', () => {
    const session = { day: { date: day }, startTime: start, endTime: end, checkInMinutesBefore: 20, checkInMinutesAfter: 0 };

    expect(isCheckInOpen(session, new Date('2026-11-18T21:39:00Z'))).toBe(false);
    expect(isCheckInOpen(session, new Date('2026-11-18T21:40:00Z'))).toBe(true);
    expect(isCheckInOpen(session, new Date('2026-11-18T23:00:00Z'))).toBe(true);
    expect(isCheckInOpen(session, new Date('2026-11-18T23:01:00Z'))).toBe(false);
  });

  it('says when check-in opens relative to the start', () => {
    expect(checkInOpensRelative({})).toBe('5 minutes before it starts');
    expect(checkInOpensRelative({ checkInMinutesBefore: 1 })).toBe('1 minute before it starts');
    expect(checkInOpensRelative({ checkInMinutesBefore: 0 })).toBe('when it starts');
  });

  it('refuses a setting that is not a whole number of minutes from 0 to a day', () => {
    expect(checkInMinutesProblem(0, 'Check-in opens')).toBeNull();
    expect(checkInMinutesProblem('30', 'Check-in opens')).toBeNull();
    expect(checkInMinutesProblem(1440, 'Check-in opens')).toBeNull();

    for (const bad of ['', '-1', '2.5', 'ten', null, 1441]) {
      expect(checkInMinutesProblem(bad, 'Check-in opens')).toBe(
        'Check-in opens must be a whole number of minutes from 0 to 1440.'
      );
    }
  });
});
