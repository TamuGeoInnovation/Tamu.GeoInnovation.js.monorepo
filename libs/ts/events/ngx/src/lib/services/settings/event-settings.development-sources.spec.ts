const gis = vi.hoisted(() => ({ development: false }));

vi.mock('@tamu-gisc/aggiemap/ngx/common', async (original) => ({
  ...(await original<object>()),
  readsDevelopmentGisServer: () => gis.development
}));

import { WOMENS_BASKETBALL_LAYERS } from '../../definitions/womens-basketball.definitions';
import { EventSettingsService } from './event-settings.service';

/**
 * The athletics maps read one schema, on both environments (#2465).
 *
 * This file used to prove the opposite: that a map could carry a `developmentSources` fork and that
 * `readsDevelopmentGisServer` chose between it and a production version. Women's Basketball was the
 * last map with one, and the services are being republished so production carries what development
 * already does, so there is nothing left to choose between.
 *
 * What is worth guarding survives, and is what these check: a map gets the same layers wherever it is
 * served, and every reference it declares has a source. `EventService` draws every reference, and one
 * without a source stops the whole map drawing - which is exactly how the missing Safety First layer
 * was caught when the fork came out.
 *
 * Exercised against the prototype, as `event-settings.search-sources.spec.ts` is: the method reads the
 * event's definition and nothing else.
 */
const womensBasketball = (development: boolean) => {
  gis.development = development;

  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
  (subject as unknown as { _settingsSecondaryKey: string })._settingsSecondaryKey = 'womens-basketball';

  return subject;
};

const womensBasketballSources = (development: boolean) => womensBasketball(development).eventLayerSources();

describe("the Women's Basketball map's layers (#2465)", () => {
  it.each([
    ['the development GIS server', true],
    ['production', false]
  ])('are the same two layers where %s is read', (_where, development) => {
    const sources = womensBasketballSources(development);

    expect(sources.map((source) => source.id)).toEqual([
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS
    ]);
    // Deliberately the path and not the host: `Connections` resolves its hosts once, when the module is
    // first loaded, and in a Node test there is no address to read - so it bakes production's host
    // whatever this test later says about the development server. The path is what distinguishes the
    // services, and it is host-independent. `connections.spec.ts` covers the host.
    expect(
      sources.every((source) => 'url' in source && source.url?.includes('/Hosted/WomensBasketballParking_view/FeatureServer/'))
    ).toBe(true);
  });

  it('no longer reads the development-only MapServer #2001 used', () => {
    // #2143 moved this map to the hosted view reached through the ordinary connection. Nothing should
    // read `TS/WomensBasketballParking/MapServer` again: it is stopped on the production GIS server.
    expect(
      womensBasketballSources(true).some((source) => 'url' in source && source.url?.includes('/TS/WomensBasketballParking/'))
    ).toBe(false);
  });

  it.each([
    ['the development GIS server', true],
    ['production', false]
  ])('declare no reference without a source where %s is read', (_where, development) => {
    const subject = womensBasketball(development);
    const sourceIds = new Set(subject.eventLayerSources().map((source) => source.id));

    // The hourly visitor parking kiosks and the Safety First crosswalks are not in the republished
    // service, so they are not referenced either. A reference left behind stops the map drawing.
    expect(Object.values(subject.eventLayerReferences())).toEqual([
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS
    ]);
    expect(Object.values(subject.eventLayerReferences()).every((id) => sourceIds.has(id))).toBe(true);
  });
});
