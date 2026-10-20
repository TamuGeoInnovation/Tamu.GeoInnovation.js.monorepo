import { factory } from '../utils/definitionFactory';

/**
 * Where the Lactation Rooms layer is drawn from (#1960).
 *
 * Facilities Analytics & Mapping replaced layer 2 of FCOR/MapInfo_20190529 (21 rooms) with a hosted
 * service (35 rooms) whose every field has a new name, so the popup reads the new names and would
 * show nothing if the layer were pointed back at the old service.
 *
 * The hosted service is published on the production GIS server only, where it is public, so a dev
 * build reads it from there too.
 */
const LACTATION_SPACES = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/Lactation_Spaces_view/FeatureServer/0';

describe('the Lactation Rooms layer', () => {
  it('draws from the hosted Lactation_Spaces_view service on a production build', () => {
    expect(factory({ environment: 'prod' }).Definitions.LACTATION_ROOMS.url).toBe(LACTATION_SPACES);
  });

  it('draws from the same service on a dev build', () => {
    expect(factory({ environment: 'dev' }).Definitions.LACTATION_ROOMS.url).toBe(LACTATION_SPACES);
  });
});
