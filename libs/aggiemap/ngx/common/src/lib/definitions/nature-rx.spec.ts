import { factory } from '../utils/definitionFactory';

const NATURE_RX = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/NatureRx_view/FeatureServer/0';

describe('Nature Rx (#2630)', () => {
  it('reads the production service on a production build', () => {
    expect(factory({ environment: 'prod' }).Definitions.NATURE_RX.url).toBe(NATURE_RX);
  });

  // The development GIS server has this service but answers "Token Required", so a `${gisHost}` URL would
  // draw nothing on development. It is named on gis.tamu.edu outright, as lactation rooms are, and a
  // development build reads production's spaces.
  it('reads the same production service on a development build', () => {
    expect(factory({ environment: 'dev' }).Definitions.NATURE_RX.url).toBe(NATURE_RX);
  });

  it('is on the main map, listed and off until a visitor turns it on', () => {
    const { LayerSources, Definitions } = factory({ environment: 'prod' });
    const layer = LayerSources.find((source) => source.id === Definitions.NATURE_RX.layerId);

    expect(layer).toBeDefined();
    expect(layer.title).toBe('Nature Rx');
    expect(layer.url).toBe(NATURE_RX);
    expect(layer.listMode).toBe('show');
    expect(layer.visible).toBe(false);
  });

  it('is searchable by name and by key word, and has an exact source for a shared link', () => {
    const { SearchSources } = factory({ environment: 'prod' });

    const search = SearchSources.find((source) => source.source === 'nature-rx');
    const exact = SearchSources.find((source) => source.source === 'nature-rx-exact');

    expect(search).toBeDefined();
    expect(search.searchActive).toBe(true);
    expect(JSON.stringify(search.queryParams)).toContain('area_name');
    expect(JSON.stringify(search.queryParams)).toContain('key_words');

    expect(exact).toBeDefined();
    expect(exact.searchActive).toBe(false);
    expect(exact.urlQueryParam).toBe('naturerx');
  });
});
