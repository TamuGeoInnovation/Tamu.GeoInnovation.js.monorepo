const gis = vi.hoisted(() => ({ development: false }));

vi.mock('@tamu-gisc/aggiemap/ngx/common', async (original) => ({
  ...(await original<object>()),
  readsDevelopmentGisServer: () => gis.development
}));

import { WOMENS_BASKETBALL_LAYERS } from '../../definitions/womens-basketball.definitions';
import { EventSettingsService } from './event-settings.service';

/**
 * A map's new version, published so far only on the development GIS server, is drawn wherever that
 * server is read and nowhere else (#2001).
 *
 * Transportation Services cut the Women's Basketball map to two layers on the development GIS server; on
 * the production server the service is stopped. Production must go on drawing the published version until
 * it is published there, and dev must draw the new one so it can be approved. Which hosts read which
 * server is `readsDevelopmentGisServer`'s question, tested in `connections.spec.ts`.
 *
 * Exercised against the prototype, as `event-settings.search-sources.spec.ts` is: the method reads the
 * event's definition and that one answer, and nothing else.
 */
const womensBasketball = (development: boolean) => {
  gis.development = development;

  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
  (subject as unknown as { _settingsSecondaryKey: string })._settingsSecondaryKey = 'womens-basketball';

  return subject;
};

const womensBasketballSources = (development: boolean) => womensBasketball(development).eventLayerSources();

describe("the Women's Basketball map's layers (#2001)", () => {
  it('are the new version, and only its two layers, where the development GIS server is read', () => {
    const sources = womensBasketballSources(true);

    expect(sources.map((source) => source.id)).toEqual([
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS
    ]);
    // #2001 drew these from `/TS/WomensBasketballParking/MapServer/`, a development-only service. #2143
    // replaced it with a hosted view the ordinary connection resolves to on development, so the address
    // moved; what this guards is unchanged - development reads its own service, not production's.
    expect(
      sources.every((source) => source.url?.includes('/Hosted/WomensBasketballParking_view/FeatureServer/'))
    ).toBe(true);
    // Deliberately the path and not the host: `Connections` resolves its hosts once, when the module is
    // first loaded, and in a Node test there is no address to read - so it bakes production's host
    // whatever this test later says about the development server. The path is what distinguishes the
    // two services, and it is host-independent. `connections.spec.ts` covers the host.
  });

  it('are drawn from only the references the new version has, so none is looked for and not found', () => {
    // EventService draws every reference, and a reference with no source stops the whole map drawing.
    expect(Object.values(womensBasketball(true).eventLayerReferences())).toEqual([
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS
    ]);
    expect(Object.values(womensBasketball(false).eventLayerReferences())).toHaveLength(4);
  });

  it('are the published version everywhere else, production included', () => {
    const sources = womensBasketballSources(false);

    expect(sources.map((source) => source.id)).toEqual([
      WOMENS_BASKETBALL_LAYERS.VISITOR_KIOSK,
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS,
      WOMENS_BASKETBALL_LAYERS.SAFETY_FIRST
    ]);
    expect(sources.some((source) => source.url?.includes('/TS/WomensBasketballParking/'))).toBe(false);
  });
});
