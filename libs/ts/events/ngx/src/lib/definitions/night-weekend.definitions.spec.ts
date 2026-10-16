// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { NightWeekendColdLayerSources, NightWeekendConfiguration } from './night-weekend.definitions';

/**
 * Transportation Services asked for the night and weekend map to say what its lots are and when they
 * can be used (#836).
 *
 * The lots' layer is named "Night & Weekend Lots" in its service, so the map takes that name rather
 * than overriding it with one that mentions nights only. The hours sit between the map's title and
 * its layers, in the same sidebar blocks the break and summer map uses.
 */
describe('Night / Weekend', () => {
  it("takes the lots' layer title from its service", () => {
    // A title set here would replace the service's "Night & Weekend Lots" in the layer list and legend.
    for (const source of NightWeekendColdLayerSources) {
      expect(source.title).toBeUndefined();
    }
  });

  it('shows when night and weekend privileges apply', () => {
    expect(NightWeekendConfiguration.sidebarInfo?.sections).toEqual([
      { heading: 'Night Privileges', items: ['Monday - Thursday 5:00 p.m. - 6:00 a.m.'] },
      { heading: 'Weekend Privileges', items: ['Friday 6:00 p.m. - Monday 6:00 a.m.'] }
    ]);
  });
});
