/**
 * @vitest-environment-options {"url": "https://aggiemap.tamu.edu/"}
 */
import { EventDefinitions } from './all.definitions';
import { FootballParkingConfiguration } from './football-parking.definitions';
import { TailgatingConfiguration } from './tailgating.definitions';

/**
 * The event map registry as production builds it: this file runs at aggiemap.tamu.edu, not a
 * development host.
 */
describe('Event maps on production', () => {
  it('include Football Tailgating (#1814)', () => {
    const ids = EventDefinitions.map((definition) => definition.configuration?.id);

    expect(ids).toContain('tailgating');
  });

  it("give Football Tailgating the Football Parking map's game days (#1814)", () => {
    expect(TailgatingConfiguration.eventDates).toEqual(FootballParkingConfiguration.eventDates);
  });

  it("raises Football Tailgating's game-day toast second, after the Football one (#1817)", () => {
    const toasts = EventDefinitions.filter((definition) => definition.configuration?.toast);
    const football = toasts.findIndex((definition) => definition.configuration?.id === FootballParkingConfiguration.id);
    const tailgating = toasts.findIndex((definition) => definition.configuration?.id === TailgatingConfiguration.id);

    expect(tailgating).toBe(football + 1);
    expect(TailgatingConfiguration.toast?.action).toEqual({ type: 'internal', value: '/events/tailgating' });
  });

  it('write every event date as YYYY-MM-DD (#2019)', () => {
    // Women's Basketball carried '2026-01-1' for a season. It parsed by luck; a date that does not
    // parse makes a map's "has this event passed?" answer wrong without any error.
    const malformed = EventDefinitions.flatMap((definition) =>
      definition.configuration?.eventDates
        .filter((date) => typeof date === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(date))
        .map((date) => `${definition.configuration?.id}: ${date}`)
    );

    expect(malformed).toEqual([]);
  });

  it('leaves no map stranded on a past season (#2754)', () => {
    // Fall Commencement sat on December 2025 for eleven months. Nothing caught it: the dates are
    // configuration rather than a service, so the map went on loading and drawing; the builder's
    // labels carry no year; and 17 December really was a Wednesday in 2025, so it read as correct.
    //
    // "Has a date in the future" is the wrong rule - it names 29 maps in November, nearly all of them
    // annual events waiting for next year's dates, which is normal. A check that fails every night
    // teaches people to ignore it. Two shapes are real:
    //
    //   approaching  the anniversary of its last date is within 60 days, so the map is about to be
    //                needed and still carries last year's. Fall Commencement, 40 days out.
    //   abandoned    more than 13 months have passed, so a whole cycle went by without anyone
    //                rolling it forward or marking it retired. Troubadour Festival, 18 months.
    //
    // An event genuinely over is marked `status: 'retired'`, which keeps its definition so an old
    // link still explains itself (`test/smoke/aggiemap/retired.ts`).
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const stranded = EventDefinitions.flatMap((definition) => {
      const configuration = definition.configuration;

      // `status: 'retired'` is on the `discover` entry, a sibling of `configuration` - not on the
      // configuration itself. Reading the wrong one makes every retired map look abandoned.
      if (!configuration || definition.discover?.status === 'retired') {
        return [];
      }

      const dates = configuration.eventDates
        .filter((date): date is string => typeof date === 'string')
        .map((date) => Date.parse(`${date}T12:00:00Z`))
        .filter((time) => !Number.isNaN(time));

      if (dates.length === 0) {
        return [];
      }

      const last = Math.max(...dates);
      const sinceLast = now - last;

      if (sinceLast < 0) {
        return []; // Still to come.
      }

      if (sinceLast > 396 * DAY) {
        return [`${configuration.id}: abandoned, last date ${new Date(last).toISOString().slice(0, 10)}`];
      }

      const anniversary = last + 365 * DAY;

      if (anniversary - now < 60 * DAY) {
        return [`${configuration.id}: due again ${new Date(anniversary).toISOString().slice(0, 10)}, still on ${new Date(last).toISOString().slice(0, 10)}`];
      }

      return [];
    });

    expect(stranded, 'these maps are due again soon, or a year has passed, and neither is reflected').toEqual([]);
  });
});
