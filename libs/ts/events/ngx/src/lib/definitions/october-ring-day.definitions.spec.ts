// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { RingDayConfiguration, RingDaySpecialEventOptions } from './october-ring-day.definitions';

/**
 * Each Ring Day period opens on its own view (#1230).
 *
 * The two periods cover very different areas: Pickup is a few lots beside the Williams Alumni Center,
 * Ring Day reaches out to the West Campus Garage shuttle loop. With one shared `mapCenter`/`zoom`,
 * Pickup filled a corner of the screen and Ring Day sat against the right edge. Each period's choice
 * now carries a `mapView`, which `EventService` applies in preference to the shared view.
 *
 * Whether a view frames its data well is a judgement made by eye (#1231); this guards against a period
 * losing its view, or a new period being added without one.
 */
describe('October Ring Day', () => {
  const eventDay = RingDaySpecialEventOptions.find((option) => option.value === 'event-day');

  it('offers an event-day choice', () => {
    expect(eventDay?.choices?.length).toBeGreaterThan(0);
  });

  for (const choice of eventDay?.choices ?? []) {
    it(`opens ${choice.label} on its own view`, () => {
      expect(choice.mapView).toBeDefined();
      expect(choice.mapView?.zoom).toBeDefined();
      expect(choice.mapView?.center).not.toEqual(RingDayConfiguration.mapCenter);
    });
  }
});
