import { Connections, readsDevelopmentGisServer } from './connections';

/**
 * Where the Men's Basketball map reads its layers from (#1749, then #2143).
 *
 * Transportation moved the map to the production GIS server so it can be maintained in their editor
 * map. The old service on the transportation host stopped being updated, and a map still pointing at it
 * showed last season's lots and closures with nothing to say they were stale. So this was pinned to one
 * address on every environment.
 *
 * **That pin was lifted deliberately in #2143**, not by accident: the GIS team now publish and maintain
 * a development copy of every service, so the development view is kept current rather than abandoned,
 * and the staleness #1749 removed does not come back with it. The two tests below are what that costs -
 * each environment must read its own, and neither may quietly become the other.
 *
 * The paths differ as well as the hosts, which is why both are written out: production is `MBskt_view`,
 * development is `MensBasketballParking_view`.
 */
describe('Connections', () => {
  it("reads Men's Basketball from the production GIS server's MBskt_view", () => {
    expect(Connections.mensBasketballUrl).toBe('https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer');
  });

  it("reads Men's Basketball from the development view on a development build (#2143)", () => {
    expect(Connections('gis-dev.it.tamu.edu').mensBasketballUrl).toBe(
      'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/MensBasketballParking_view/FeatureServer'
    );
  });

  it('keeps the two apart, so neither environment silently reads the other', () => {
    expect(Connections('gis-dev.it.tamu.edu').mensBasketballUrl).not.toBe(Connections.mensBasketballUrl);
  });

  // Graduation's development copy was republished as a hosted view on the development GIS server, and the old one is
  // to be decommissioned once AggieMap reads the new (#2530). Production stays on the transportation host.
  it('reads Graduation from the development hosted view on a development build (#2530)', () => {
    expect(Connections('gis-dev.it.tamu.edu').graduationParkingUrl).toBe(
      'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/GraduationParking_view/FeatureServer'
    );
  });

  it("reads Graduation from the transportation host's view on production", () => {
    expect(Connections('gis.it.tamu.edu').graduationParkingUrl).toBe(
      'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/GraduationParking_view/FeatureServer'
    );
  });

  // RoutingProPublish is published on the development GIS server only (#659). It is pinned there, as the bus routes
  // are, so that localhost reaches it too; the trip planner reads it only where development-only features are on.
  it('names the development routing network on the development GIS server, from any host', () => {
    const expected = 'https://gis-dev.it.tamu.edu/arcgis/rest/services/RoutingProPublish';

    expect(Connections.developmentRoutingBaseUrl).toBe(expected);
    expect(Connections('gis.it.tamu.edu').developmentRoutingBaseUrl).toBe(expected);
  });

  it('still names production its own, empty, Routing folder', () => {
    expect(Connections('gis.it.tamu.edu').routingBaseUrl).toBe('https://gis.it.tamu.edu/arcgis/rest/services/Routing');
  });
});

/**
 * Which pages read the development GIS server (#2001), and so draw what is published only there: a map's
 * `developmentSources`, which must stay off production until its owner publishes it.
 */
describe('readsDevelopmentGisServer', () => {
  const at = (address: string) => {
    const url = new URL(address);

    return readsDevelopmentGisServer({ hostname: url.hostname, search: url.search });
  };

  afterEach(() => sessionStorage.clear());

  it('is true on dev', () => {
    expect(at('https://dev.aggiemap.tamu.edu/events/womens-basketball')).toBe(true);
  });

  it('is false on production, on localhost and on 127.0.0.1, which read the production server', () => {
    expect(at('https://aggiemap.tamu.edu/events/womens-basketball')).toBe(false);
    expect(at('http://localhost:4200/events/womens-basketball')).toBe(false);
    expect(at('http://127.0.0.1:4200/events/womens-basketball')).toBe(false);
  });

  it('is false on dev asked to behave as production (#1722)', () => {
    expect(at('https://dev.aggiemap.tamu.edu/events/womens-basketball?as=production')).toBe(false);
  });
});
