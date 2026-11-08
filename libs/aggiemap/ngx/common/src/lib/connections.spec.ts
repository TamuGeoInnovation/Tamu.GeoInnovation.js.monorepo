import { Connections, IComposedConnections, readsDevelopmentGisServer } from './connections';

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

  // RoutingProPublish is published on the development GIS server only (#659). It is pinned there
  // so that localhost reaches it too; the trip planner reads it only where development-only features are on.
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

const NO_HOSTED_VIEW_ON_DEVELOPMENT =
  "the development server has only the older MapServer the hosted view replaced, which lacks objectid (the search sources and share links are built on it) and the view's other fields";
const RETIRED = 'a retired 150th-anniversary event, with no counterpart on the development server';

/**
 * Transportation's services that a development build still reads from production, each with why (#2653). This is the
 * list to take to Transportation: publish the hosted view on the development server and the map becomes testable
 * there. Measured 5 November 2026 against both hosts, by layer id, layer name and field list.
 */
const READ_FROM_PRODUCTION_ON_DEVELOPMENT: Partial<Record<keyof IComposedConnections, string>> = {
  tsMainUrl:
    'layer 6 on the development server lacks the GIS.TS.SPC_PNT_CNT.* space counts, which the parking search and drive directions read',
  accessibleParkingUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  beefCattleUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  constructionUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  familyWeekendUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  fireSchoolUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  gamesOfTexasUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  maroonWhiteGameUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  moveInParkingUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  ms150Url: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  ringDayUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  summerCommencementUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  tCampUrl: NO_HOSTED_VIEW_ON_DEVELOPMENT,
  fourHRoundupUrl:
    'the development server has the hosted view but answers 499 "Token Required", so a development build cannot read it (#2695)',
  kickoff150thUrl: RETIRED,
  kickoffAtKyleUrl: RETIRED,
  liveAtTheStationUrl: RETIRED,
  spiritOf150WeekUrl: RETIRED
};

/**
 * A development build reads Transportation's development services (#2653). The failure this guards against is not a
 * wrong address but a right one nobody revisited: the transportation host was pinned to production while the
 * development copies were published one by one, so maps that could have been tested on dev were not.
 */
describe("Transportation's services on a development build (#2653)", () => {
  const production = Connections('gis.it.tamu.edu');
  const development = Connections('gis-dev.it.tamu.edu');
  const onProductionHost = (url: string) => url.startsWith('https://arc.ts.tamu.edu/');
  const transportation = (Object.keys(production) as Array<keyof IComposedConnections>).filter((key) =>
    onProductionHost(production[key])
  );

  it('reads the development server for every one, except those listed with why', () => {
    expect(
      transportation.filter((key) => onProductionHost(development[key]) && !READ_FROM_PRODUCTION_ON_DEVELOPMENT[key])
    ).toEqual([]);
  });

  it('lists only services a development build still reads from production', () => {
    const listed = Object.keys(READ_FROM_PRODUCTION_ON_DEVELOPMENT) as Array<keyof IComposedConnections>;

    expect(listed.filter((key) => !onProductionHost(development[key]))).toEqual([]);
  });

  it("reads production's TS_Events services from the development server's TS folder", () => {
    expect(production.businessParkingUrl).toBe(
      'https://arc.ts.tamu.edu/arcgis/rest/services/TS_Events/BusinessParking/MapServer'
    );
    expect(development.businessParkingUrl).toBe(
      'https://gis.dev.tamu.edu/arcgis/rest/services/TS/BusinessParking/MapServer'
    );
  });

  /**
   * 4-H Roundup is the one #2653 got wrong (#2695). Its view is on the development server with the same
   * layers and fields, so the audit moved it - and it answers 499 "Token Required", which a browser with
   * no token cannot read. Existing is not the test; being readable without a token is.
   */
  it('reads 4-H Roundup from production, because the development view requires a token', () => {
    expect(development.fourHRoundupUrl).toBe(
      'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/4H_Roundup_view/FeatureServer'
    );
  });

  it("reads Muster from the development server's MusterParking_view, a different name with the same layers and fields", () => {
    expect(development.musterUrl).toBe(
      'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/MusterParking_view/FeatureServer'
    );
  });

  /**
   * The bus map read `TS/Bus_Routes` from the development server on every environment, production included, because
   * it was public nowhere else (#2636). Its hosted view is public on both hosts, so each reads its own.
   */
  it("reads the bus routes from each environment's own hosted view", () => {
    expect(production.busRoutesUrl).toBe(
      'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer'
    );
    expect(development.busRoutesUrl).toBe(
      'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer'
    );
  });
});
