/**
 * @jest-environment-options {"url": "https://aggiemap.tamu.edu/"}
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
    const ids = EventDefinitions.map((definition) => definition.configuration.id);

    expect(ids).toContain('tailgating');
  });

  it("give Football Tailgating the Football Parking map's game days (#1814)", () => {
    expect(TailgatingConfiguration.eventDates).toEqual(FootballParkingConfiguration.eventDates);
  });
});
