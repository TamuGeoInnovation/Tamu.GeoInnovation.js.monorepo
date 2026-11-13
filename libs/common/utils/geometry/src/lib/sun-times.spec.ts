import { COLLEGE_STATION, isSunDown, nextSunChange, sunTimes } from './sun-times';

const { latitude, longitude } = COLLEGE_STATION;

/**
 * The US Naval Observatory's published times for 30.615 N, 96.34 W (aa.usno.navy.mil/api/rstt/oneday, tz -6 with
 * daylight saving), read on 11 November 2026. They are rounded to the minute, so a calculation is right if it is within
 * a minute of them. Each is written with its own offset: -05:00 in daylight time, -06:00 in standard time.
 */
const published: Array<{ day: string; sunrise: string; sunset: string; why: string }> = [
  { day: '2026-03-07', sunrise: '2026-03-07T06:45-06:00', sunset: '2026-03-07T18:28-06:00', why: 'the last day of CST' },
  { day: '2026-03-08', sunrise: '2026-03-08T07:44-05:00', sunset: '2026-03-08T19:29-05:00', why: 'the first day of CDT' },
  { day: '2026-06-21', sunrise: '2026-06-21T06:23-05:00', sunset: '2026-06-21T20:31-05:00', why: 'the June solstice' },
  { day: '2026-10-31', sunrise: '2026-10-31T07:39-05:00', sunset: '2026-10-31T18:38-05:00', why: 'the last day of CDT' },
  { day: '2026-11-01', sunrise: '2026-11-01T06:40-06:00', sunset: '2026-11-01T17:37-06:00', why: 'the first day of CST' },
  { day: '2026-12-21', sunrise: '2026-12-21T07:19-06:00', sunset: '2026-12-21T17:29-06:00', why: 'the December solstice' }
];

const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

describe('sunTimes in College Station', () => {
  for (const { day, sunrise, sunset, why } of published) {
    it(`is within a minute of the Naval Observatory on ${day}, ${why}`, () => {
      // Midday Central, as a phone would ask.
      const times = sunTimes(new Date(`${day}T12:00:00-06:00`), latitude, longitude);

      expect(minutesApart(times.sunrise, new Date(sunrise))).toBeLessThanOrEqual(1);
      expect(minutesApart(times.sunset, new Date(sunset))).toBeLessThanOrEqual(1);
    });
  }

  it('gives the same day whatever time of that day it is asked, late evening included', () => {
    const morning = sunTimes(new Date('2026-11-11T00:30:00-06:00'), latitude, longitude);
    const lateEvening = sunTimes(new Date('2026-11-11T23:30:00-06:00'), latitude, longitude);

    expect(lateEvening.sunset.getTime()).toBe(morning.sunset.getTime());
  });

  it('returns null where the sun does not set, inside the Arctic circle in June', () => {
    expect(sunTimes(new Date('2026-06-21T12:00:00Z'), 78, 15)).toBeNull();
  });
});

describe('isSunDown', () => {
  it('is false at noon and true at midnight', () => {
    expect(isSunDown(new Date('2026-11-11T12:00:00-06:00'), latitude, longitude)).toBe(false);
    expect(isSunDown(new Date('2026-11-11T00:00:00-06:00'), latitude, longitude)).toBe(true);
  });

  it('turns over at the published sunset on the first day of CST, not an hour off', () => {
    expect(isSunDown(new Date('2026-11-01T17:35-06:00'), latitude, longitude)).toBe(false);
    expect(isSunDown(new Date('2026-11-01T17:39-06:00'), latitude, longitude)).toBe(true);
  });

  it('turns over at the published sunrise on the first day of CDT, not an hour off', () => {
    expect(isSunDown(new Date('2026-03-08T07:42-05:00'), latitude, longitude)).toBe(true);
    expect(isSunDown(new Date('2026-03-08T07:46-05:00'), latitude, longitude)).toBe(false);
  });
});

describe('nextSunChange', () => {
  it('is that day’s sunset during the day', () => {
    const next = nextSunChange(new Date('2026-06-21T12:00-05:00'), latitude, longitude);

    expect(minutesApart(next, new Date('2026-06-21T20:31-05:00'))).toBeLessThanOrEqual(1);
  });

  it('is the next morning’s sunrise after sunset', () => {
    const next = nextSunChange(new Date('2026-10-31T21:00-05:00'), latitude, longitude);

    // Across the change of clocks: Saturday evening in CDT to Sunday morning in CST.
    expect(minutesApart(next, new Date('2026-11-01T06:40-06:00'))).toBeLessThanOrEqual(1);
  });
});
