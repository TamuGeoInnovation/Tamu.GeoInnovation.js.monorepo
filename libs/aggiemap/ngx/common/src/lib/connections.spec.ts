import { Connections, readsDevelopmentGisServer } from './connections';

/**
 * Where the Men's Basketball map reads its layers from (#1749).
 *
 * Transportation moved the map to the production GIS server so it can be maintained in their editor
 * map. The old service on the transportation host stops being updated, so a map still pointing at it
 * would show last season's lots and closures with nothing to say they were stale.
 */
describe('Connections', () => {
  it("reads Men's Basketball from the production GIS server's MBskt_view", () => {
    expect(Connections.mensBasketballUrl).toBe('https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer');
  });

  it("reads Men's Basketball from the same address whatever GIS host a build uses", () => {
    expect(Connections('gis-dev.it.tamu.edu').mensBasketballUrl).toBe(Connections.mensBasketballUrl);
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
