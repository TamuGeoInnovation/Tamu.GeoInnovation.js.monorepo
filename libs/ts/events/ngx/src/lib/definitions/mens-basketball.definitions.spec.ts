// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

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

    expect(parking?.popupData?.name).toBe('{attributes.name}');
  });
});
