import { solarDeclinationAndEquationOfTime, sunPosition } from './sun';

// College Station, by the Academic Building.
const latitude = 30.615;
const longitude = -96.341;

describe('solarDeclinationAndEquationOfTime', () => {
  it('matches Meeus example 25.a (13 October 1992) to a hundredth of a degree', () => {
    // Meeus gives an apparent declination of -7.78507 degrees for 1992 October 13.0 TD.
    const { declination } = solarDeclinationAndEquationOfTime(new Date(Date.UTC(1992, 9, 13, 0, 0, 0)));

    expect(declination).toBeCloseTo(-7.785, 2);
  });

  it('has the sun near 23.44 degrees north at the June solstice and south at the December one', () => {
    expect(solarDeclinationAndEquationOfTime(new Date('2026-06-21T12:00:00Z')).declination).toBeCloseTo(23.44, 1);
    expect(solarDeclinationAndEquationOfTime(new Date('2026-12-21T12:00:00Z')).declination).toBeCloseTo(-23.44, 1);
  });

  it('has the equation of time at its yearly extremes in early November and mid-February', () => {
    // About +16.4 minutes on 3 November and -14.2 minutes on 11 February.
    expect(solarDeclinationAndEquationOfTime(new Date('2026-11-03T18:00:00Z')).equationOfTime).toBeCloseTo(16.4, 0);
    expect(solarDeclinationAndEquationOfTime(new Date('2026-02-11T18:00:00Z')).equationOfTime).toBeCloseTo(-14.2, 0);
  });
});

describe('sunPosition', () => {
  it('puts the sun due south and 90 - latitude + declination high at solar noon', () => {
    // On 21 June solar noon in College Station is near 1:27 PM CDT; search for the highest sun that day.
    let highest = { azimuth: 0, altitude: -90 };

    for (let minute = 0; minute < 24 * 60; minute++) {
      const p = sunPosition(new Date(Date.UTC(2026, 5, 21, 5, minute)), latitude, longitude);

      if (p.altitude > highest.altitude) {
        highest = p;
      }
    }

    expect(highest.altitude).toBeCloseTo(90 - latitude + 23.44, 0);
    // So close to overhead the azimuth swings fast; it is south to within a few degrees.
    expect(Math.abs(highest.azimuth - 180)).toBeLessThan(5);
  });

  it('has the sun in the south-west and high on a September afternoon at 3 PM Central', () => {
    // 15 September 2026, 3 PM CDT (20:00 UTC). By hand: declination +2.9 degrees, equation of time +4.8 minutes, so
    // local solar time is 13:39 and the hour angle 24.9 degrees west. That gives an altitude of 53.7 degrees and an
    // azimuth of 225 degrees (south-west).
    const p = sunPosition(new Date('2026-09-15T15:00:00-05:00'), latitude, longitude);

    expect(p.azimuth).toBeCloseTo(225, 0);
    expect(p.altitude).toBeCloseTo(53.7, 0);
  });

  it('has the sun low in the east on a September morning at 8 AM Central', () => {
    const p = sunPosition(new Date('2026-09-15T08:00:00-05:00'), latitude, longitude);

    expect(p.azimuth).toBeGreaterThan(85);
    expect(p.azimuth).toBeLessThan(100);
    expect(p.altitude).toBeGreaterThan(5);
    expect(p.altitude).toBeLessThan(15);
  });

  it('rises close to due east at the equinox', () => {
    // Find the minute the sun crosses the horizon on the morning of 22 September.
    let previous = sunPosition(new Date(Date.UTC(2026, 8, 22, 10, 0)), latitude, longitude);

    for (let minute = 1; minute < 240; minute++) {
      const p = sunPosition(new Date(Date.UTC(2026, 8, 22, 10, minute)), latitude, longitude);

      if (previous.altitude <= 0 && p.altitude > 0) {
        expect(Math.abs(p.azimuth - 90)).toBeLessThan(2);

        return;
      }

      previous = p;
    }

    throw new Error('The sun did not rise between 5 and 9 AM CDT.');
  });

  it('is below the horizon at night', () => {
    expect(sunPosition(new Date('2026-09-15T23:00:00-05:00'), latitude, longitude).altitude).toBeLessThan(0);
  });

  it('gives the same answer whatever offset the moment is written in', () => {
    const central = sunPosition(new Date('2026-09-15T15:00:00-05:00'), latitude, longitude);
    const utc = sunPosition(new Date('2026-09-15T20:00:00Z'), latitude, longitude);

    expect(utc).toEqual(central);
  });
});
