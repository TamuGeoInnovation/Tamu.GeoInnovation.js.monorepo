import { Connections } from './connections';

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
