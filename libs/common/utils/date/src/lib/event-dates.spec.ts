import { eventHasPassed, parseEventDate } from './common-utils-date';

/**
 * An event is not "over" until its last day is (#1298).
 *
 * The map read `'2026-10-02'` as midnight UTC - 7 PM on 1 October in College Station - and called the
 * 150th Opening Ceremony over on the evening before it. These run in College Station's time zone, where
 * that happened, whatever zone the machine running them is in: `jest.global-setup.js` sets it.
 */
describe('event dates in College Station time', () => {
  const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

  it('runs in a time zone behind UTC, or this proves nothing', () => {
    expect(new Date(2026, 9, 1).getTimezoneOffset()).toBeGreaterThan(0);
  });

  it('reads a date-only string as local midnight', () => {
    expect(parseEventDate('2026-10-02')).toBe(at(2026, 10, 2));
  });

  it('has not passed on the evening before the event', () => {
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 1, 23, 25))).toBe(false);
  });

  it('has not passed at any time on the day itself', () => {
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 2, 0, 1))).toBe(false);
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 2, 23, 59))).toBe(false);
  });

  it('has passed the day after', () => {
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 3, 0, 1))).toBe(true);
  });

  it('with a day of grace, still has not passed the day after', () => {
    // The event-passed popup waits a full day after the event (maintainer's decision, 1 October).
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 3, 12), 1)).toBe(false);
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 3, 23, 59), 1)).toBe(false);
  });

  it('with a day of grace, has passed from midnight two days after', () => {
    expect(eventHasPassed(['2026-10-02'], at(2026, 10, 4, 0, 1), 1)).toBe(true);
  });

  it('counts the grace in calendar days across the end of daylight saving', () => {
    // Central time falls back on 1 November 2026: that day is 25 hours long.
    expect(eventHasPassed(['2026-10-31'], at(2026, 11, 1, 23, 30), 1)).toBe(false);
    expect(eventHasPassed(['2026-10-31'], at(2026, 11, 2, 0, 1), 1)).toBe(true);
  });

  it('waits for the last of several dates', () => {
    expect(eventHasPassed(['2026-10-09', '2026-10-10'], at(2026, 10, 10, 12))).toBe(false);
    expect(eventHasPassed(['2026-10-09', '2026-10-10'], at(2026, 10, 11, 9))).toBe(true);
  });

  it('never calls an event with no usable dates over', () => {
    expect(eventHasPassed([], at(2026, 10, 1))).toBe(false);
    expect(eventHasPassed(undefined, at(2026, 10, 1))).toBe(false);
    expect(eventHasPassed(['not a date'], at(2026, 10, 1))).toBe(false);
  });
});
