import { DEVELOPMENT_ONLY_LAYER_SOURCES, developmentOnlySearchSources } from '../development-only-sources';
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

  // A development build, because #2673 leaves this layer out of a production one altogether.
  it('is on the main map, listed and off until a visitor turns it on', () => {
    const { LayerSources, Definitions } = factory({ environment: 'dev' });
    const layer = LayerSources.find((source) => source.id === Definitions.NATURE_RX.layerId);

    expect(layer).toBeDefined();
    expect(layer.title).toBe('Nature Rx');
    expect(layer.url).toBe(NATURE_RX);
    expect(layer.listMode).toBe('show');
    expect(layer.visible).toBe(false);
  });

  it('is searchable by name and by key word, and has an exact source for a shared link', () => {
    const { SearchSources } = factory({ environment: 'dev' });

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

/**
 * Nature Rx is not ready for production (#2673). It went on the map with no gate, so it was offered on every
 * environment; seen on dev it was clearly unfinished.
 *
 * These are the checks #1090 was missing when the Bus Routes tab shipped to production as a button that
 * apologised for being unavailable: the gate existed, and nothing asserted that the production variant
 * actually hid it. So assert both sides - absent where the public is, present where the work is - because a
 * gate that hides a layer everywhere is the other way to get this wrong, and it looks like success.
 */
describe('Nature Rx is development-only (#2673)', () => {
  const natureRx = (build: ReturnType<typeof factory>) => ({
    layer: build.LayerSources.find((source) => source.id === build.Definitions.NATURE_RX.layerId),
    search: build.SearchSources.find((source) => source.source === 'nature-rx'),
    exact: build.SearchSources.find((source) => source.source === 'nature-rx-exact')
  });

  it('is absent from a production build: not in Layers, not searchable, no shared link', () => {
    const { layer, search, exact } = natureRx(factory({ environment: 'prod' }));

    expect(layer).toBeUndefined();
    expect(search).toBeUndefined();
    expect(exact).toBeUndefined();
  });

  it('is present on a development build, so the work can carry on', () => {
    const { layer, search, exact } = natureRx(factory({ environment: 'dev' }));

    expect(layer).toBeDefined();
    expect(search).toBeDefined();
    expect(exact).toBeDefined();
  });

  it('is present on the local serve, which otherwise behaves as production', () => {
    const { layer, search, exact } = natureRx(factory({ environment: 'prod', includeDevelopmentOnly: true }));

    expect(layer).toBeDefined();
    expect(search).toBeDefined();
    expect(exact).toBeDefined();
  });

  // The gate is a list, so the thing most likely to go wrong is the list losing an entry rather than the
  // mechanism breaking. Every entry is a deliberate act with its own issue: Micromobility joined it for #2739.
  it('is held back with the issue that holds it, and only Micromobility besides', () => {
    expect(DEVELOPMENT_ONLY_LAYER_SOURCES.map((source) => source.definition)).toEqual(['NATURE_RX', 'MICROMOBILITY']);
    expect(DEVELOPMENT_ONLY_LAYER_SOURCES[0].reason).toContain('#2673');
    expect(developmentOnlySearchSources()).toEqual(['NATURE_RX', 'NATURE_RX_EXACT']);
  });
});
