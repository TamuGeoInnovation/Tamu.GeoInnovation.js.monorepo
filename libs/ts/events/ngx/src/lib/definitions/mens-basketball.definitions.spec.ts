// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { EventSettingsService } from '../services/settings/event-settings.service';
import { MensBasketball_ColdLayerSources, MensBasketball_Definitions } from './mens-basketball.definitions';

/**
 * The Men's Basketball parking popup's title (#1749).
 *
 * The parking layer has a `name` field ("Lot 74", "100a") and no `lottype` or `lotnum`, on the old
 * service and on the production one that replaced it. A title built from those two fields came out
 * as a bare " - ", so clicking a lot never said which lot it was.
 */
describe("Men's Basketball", () => {
  it('titles a parking lot popup with the lot name', () => {
    const parking = MensBasketball_ColdLayerSources.find((source) => source.id === MensBasketball_Definitions.PARKING.id);

    expect(parking?.popupData?.['name']).toBe('{attributes.name}');
  });
});

/**
 * Men's Basketball reaches the map without a reload, as football does (#2558, #1587).
 *
 * Staff edit the service on game day: a lot's type set to Lot Closed, a closure drawn, an Alert icon placed. Each
 * layer polls its service every minute, so a visitor with the map open sees the change. All three layers, because
 * all three are what the editor changes: the issue names the icons and the parking, and the closures are the layer
 * the closures are drawn on.
 *
 * Read as the map is given them, through the settings service, since #2581 moved the refresh from each layer's
 * definition to the event's `gameDayRefresh` switch.
 */
describe("Men's Basketball game-day edits", () => {
  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
  (subject as unknown as { _settingsSecondaryKey: string })._settingsSecondaryKey = 'mens-basketball';
  const served = subject.eventLayerSources();

  it('declares its three layers', () => {
    expect(served.length).toBe(3);
  });

  for (const source of served) {
    it(`${source.id} refreshes every minute`, () => {
      expect((source.native as { refreshInterval?: number } | undefined)?.refreshInterval).toBe(1);
    });
  }
});
