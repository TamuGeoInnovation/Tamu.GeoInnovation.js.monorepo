// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { EventDefinitions } from './all.definitions';
import { KioskBuildingsLayerSource } from './dining.definitions';
import { TailgatingColdLayerSources, TailgatingConfiguration, TailgatingLinkSources } from './tailgating.definitions';
import { TAILGATING_KIOSK_LAYERS, TailgatingKioskTs } from './tailgating-kiosk.definitions';

/**
 * The Football Tailgating kiosk (#1975): the tailgating map with no sidebar, drawn from the tailgating
 * map's own definitions.
 */
describe('Football Tailgating kiosk', () => {
  const { configuration, sources, references, discover } = TailgatingKioskTs;

  it('is a kiosk map, with no sidebar', () => {
    // Both are typed as possibly null; every test below reads them with ?., so this is what fails if either is missing.
    expect(configuration).toBeTruthy();
    expect(sources).toBeTruthy();
    expect(discover?.type).toBe('kiosk');
    expect(discover?.mapType).toBe('kiosk');
    expect(configuration?.hideSidebar).toBe(true);
  });

  it('is registered, under an id of its own', () => {
    const ids = EventDefinitions.map((definition) => definition.configuration?.id);

    expect(EventDefinitions).toContain(TailgatingKioskTs);
    expect(ids.filter((id) => id === configuration?.id)).toHaveLength(1);
    expect(configuration?.id).not.toBe(TailgatingConfiguration.id);
  });

  it("draws the tailgating map's own layers, the same objects rather than copies, and the buildings", () => {
    expect(sources).toEqual([...TailgatingColdLayerSources, KioskBuildingsLayerSource]);
    TailgatingColdLayerSources.forEach((source, index) => expect(sources?.[index]).toBe(source));
  });

  it('has a reference for every layer it draws, and no other', () => {
    expect(Object.values(references ?? {}).sort()).toEqual(sources?.map((source) => source.id).sort());
    expect(Object.values(TAILGATING_KIOSK_LAYERS).at(-1)).toBe(KioskBuildingsLayerSource.id);
  });

  it("opens where the tailgating map opens, on the tailgating map's basemap", () => {
    expect(configuration?.mapCenter).toEqual(TailgatingConfiguration.mapCenter);
    expect(configuration?.zoom).toBe(TailgatingConfiguration.zoom);
    expect(configuration?.basemap).toBe(TailgatingConfiguration.basemap);
  });

  it("takes the tailgating map's ?tent= and ?zone= links", () => {
    expect(configuration?.searchSources).toBe(TailgatingLinkSources);
    expect(configuration?.searchSources?.map((source) => source.urlQueryParam).sort()).toEqual(['tent', 'zone']);
  });

  it('raises no game-day toast and no season-over warning', () => {
    expect(configuration?.toast).toBeUndefined();
    expect(configuration?.eventDates).toEqual([]);
  });
});
