import { EventDefinitions } from './all.definitions';
import { GisDayConfiguration } from './gis-day-map.definitions';

/**
 * The notices the main map raises for an event that is on now or within a week (#2678).
 *
 * GIS Day had this year's dates and no `toast`, and `EventNotificationsService` skips an event without
 * one before it looks at a date - so its notice had never been capable of appearing, in any year. The
 * absence of a notice looks exactly like a quiet week, which is why no one noticed.
 *
 * **There is deliberately no rule that every event map has a notice.** Twenty-seven definitions carry
 * event dates and a Discover entry with no toast, and that is correct: a notice is for an event the
 * public is being invited to, not for every permit map. So this asserts GIS Day specifically, and then
 * asserts the things that are true of *every* toast - which is where a copied definition goes wrong.
 */
describe('event notices (#2678)', () => {
  const withToast = EventDefinitions.filter((definition) => definition.configuration?.toast);

  it('GIS Day raises one, through the week it says it is on', () => {
    expect(GisDayConfiguration.toast).toBeDefined();
    expect(GisDayConfiguration.eventDates).toEqual([
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20'
    ]);
  });

  it('GIS Day sends a visitor to its own event map', () => {
    expect(GisDayConfiguration.toast.action).toEqual({ type: 'internal', value: '/events/gis-day' });
  });

  /**
   * The service appends the season from the earliest event date (#2051), so a year typed into the id by
   * hand is what stopped baseball's notice coming back for a new season. Nothing should carry one.
   */
  it('no notice has a season typed into its id', () => {
    const withYear = withToast
      .filter((definition) => /(19|20)\d{2}/.test(definition.configuration.toast.id))
      .map((definition) => definition.configuration.toast.id);

    expect(withYear).toEqual([]);
  });

  /** A copied definition that kept the other event's route sends people to the wrong map, and looks fine. */
  it('every notice that opens a map opens its own', () => {
    const wrong = withToast
      .filter((definition) => definition.configuration.toast.action?.type === 'internal')
      .filter((definition) => definition.configuration.toast.action.value !== `/events/${definition.configuration.id}`)
      .map((definition) => `${definition.configuration.id} -> ${definition.configuration.toast.action.value}`);

    expect(wrong).toEqual([]);
  });

  /** An acknowledged notice is remembered by id, so two events sharing one silence each other. */
  it('no two events share a notice id', () => {
    const ids = withToast.map((definition) => definition.configuration.toast.id);

    expect(ids.length).toBe(new Set(ids).size);
  });
});
