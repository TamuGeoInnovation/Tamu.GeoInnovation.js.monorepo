import { BaseLayerConstructors, makeBaseLayer } from './basemap-layers';

/**
 * Turning a basemap definition's layer descriptions into layers (#1692).
 *
 * Aerial Imagery is a WMS layer. The map could only make tiled layers, so a saved Aerial Imagery choice
 * could not be opened from its definition and an event map started with no basemap at all.
 */
describe('making a base layer from its description', () => {
  class Made {
    constructor(
      public readonly kind: string,
      public readonly props: Record<string, unknown>
    ) {}
  }

  // Functions, not arrows: the code calls them with `new`, and Vitest constructs a mock's implementation.
  const constructors = {
    TileLayer: vi.fn(function (props) {
      return new Made('tile', props);
    }),
    VectorTileLayer: vi.fn(function (props) {
      return new Made('vector-tile', props);
    }),
    WMSLayer: vi.fn(function (props) {
      return new Made('wms', props);
    })
  } as unknown as BaseLayerConstructors;

  it('makes a WMS layer, which Aerial Imagery is', () => {
    const layer = makeBaseLayer({ type: 'WMSLayer', url: 'https://example.test/wms', visible: true }, constructors);

    expect(layer).toEqual(new Made('wms', { url: 'https://example.test/wms', visible: true }));
  });

  it('still makes the tiled layers the campus basemaps use', () => {
    expect(makeBaseLayer({ type: 'TileLayer', url: 'a' }, constructors)).toEqual(new Made('tile', { url: 'a' }));
    expect(makeBaseLayer({ type: 'VectorTileLayer', url: 'b' }, constructors)).toEqual(
      new Made('vector-tile', { url: 'b' })
    );
  });

  it('does not pass the type on, which the layer classes treat as read-only', () => {
    const layer = makeBaseLayer({ type: 'WMSLayer', url: 'c' }, constructors) as unknown as Made;

    expect(layer.props).not.toHaveProperty('type');
  });

  it('refuses a layer type it cannot make, rather than leaving the basemap a layer short', () => {
    expect(() => makeBaseLayer({ type: 'ImageryLayer' }, constructors)).toThrow(
      "Unsupported basemap layer type 'ImageryLayer'"
    );
    expect(() => makeBaseLayer({}, constructors)).toThrow('Layer type is required.');
  });
});
