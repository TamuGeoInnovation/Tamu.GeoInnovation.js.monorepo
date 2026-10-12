// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { AprilRingDayConfiguration, AprilRingDaySpecialEventOptions } from './april-ring-day.definitions';

/**
 * April's Ring Day, held to what October's and November's are (#1230, #1688).
 *
 * Each period opens on its own view. The two cover very different places - pick-up is a few lots
 * beside the Williams Alumni Center, the ring day reaches out to the West Campus Garage shuttle loop -
 * so one shared `mapCenter` and `zoom` frames neither well: pick-up filled a corner of the screen and
 * the ring day sat against the right edge.
 *
 * April was the last of the three still carrying that fault, and its map is hidden out of season, so
 * nothing would have shown it until somebody unhid it next spring.
 *
 * Whether a view frames its data well is a judgement made by eye (#1231); these guard against a
 * period losing its view, or a new period being added without one.
 */
describe('April Ring Day', () => {
  const eventDay = AprilRingDaySpecialEventOptions.find((option) => option.value === 'event-day');

  it('offers an event-day choice', () => {
    expect(eventDay?.choices?.length).toBeGreaterThan(0);
  });

  it('offers both the pick-up day and the ring day', () => {
    const labels = (eventDay?.choices ?? []).map((choice) => choice.label);

    expect(labels).toHaveLength(2);
    expect(labels.some((label) => /pickup/i.test(label))).toBe(true);
    expect(labels.some((label) => /ring day/i.test(label))).toBe(true);
  });

  for (const choice of eventDay?.choices ?? []) {
    it(`opens ${choice.label} on its own view`, () => {
      expect(choice.mapView).toBeDefined();
      expect(choice.mapView?.zoom).toBeDefined();
      expect(choice.mapView?.center).not.toEqual(AprilRingDayConfiguration.mapCenter);
    });
  }
});
