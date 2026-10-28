import { applyStyleLayerChanges, BaseLayerConstructors, makeBaseLayer } from './basemap-layers';

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
    }),
    FeatureLayer: vi.fn(function (props) {
      return new Made('feature', props);
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

/**
 * The campus basemap's buildings under construction, drawn by us rather than the tiles (#2459): a feature layer
 * as one of a basemap's layers, and the tiles' own style layers turned off by id.
 */
describe('a base layer that draws over the tiles (#2459)', () => {
  it('makes a FeatureLayer', () => {
    const FeatureLayer = vi.fn(function (props) {
      return { kind: 'feature', props };
    });
    const layer = makeBaseLayer({ type: 'FeatureLayer', url: 'f', definitionExpression: "Type = 'X'" }, {
      FeatureLayer
    } as unknown as BaseLayerConstructors) as unknown as { kind: string; props: Record<string, unknown> };

    expect(layer.kind).toBe('feature');
    expect(layer.props).toEqual({ url: 'f', definitionExpression: "Type = 'X'" });
  });

  it('hides the style layers it is given once the style has loaded, and does not pass the list on', async () => {
    const setStyleLayerVisibility = vi.fn();
    let made: Record<string, unknown> = {};
    const VectorTileLayer = vi.fn(function (props) {
      made = props;
      return { when: (callback: () => void) => Promise.resolve().then(callback), setStyleLayerVisibility };
    });

    makeBaseLayer({ type: 'VectorTileLayer', url: 'v', hiddenStyleLayers: ['a/1', 'b/1'] }, {
      VectorTileLayer
    } as unknown as BaseLayerConstructors);
    await Promise.resolve();
    await Promise.resolve();

    expect(setStyleLayerVisibility.mock.calls).toEqual([
      ['a/1', 'none'],
      ['b/1', 'none']
    ]);
    expect(made).toEqual({ url: 'v' });
  });
});

/**
 * Changes to a vector tile layer's own style (#2506): the satellite campuses' construction fill is the same
 * opaque pink tile as College Station's, and is repainted inside the style rather than covered by a layer.
 */
describe("changing a vector tile layer's own style (#2506)", () => {
  function layer() {
    return {
      when: (callback: () => void) => Promise.resolve().then(callback),
      setStyleLayerVisibility: vi.fn(),
      setPaintProperties: vi.fn()
    };
  }

  it('repaints the style layers it is given, and hides the ones it is told to, once the style has loaded', async () => {
    const target = layer();

    applyStyleLayerChanges(target as unknown as __esri.VectorTileLayer, {
      hiddenStyleLayers: ['a/0'],
      styleLayerPaint: { 'b/1': { 'fill-color': 'rgba(230, 152, 0, 0.25)' } }
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(target.setStyleLayerVisibility.mock.calls).toEqual([['a/0', 'none']]);
    expect(target.setPaintProperties.mock.calls).toEqual([['b/1', { 'fill-color': 'rgba(230, 152, 0, 0.25)' }]]);
  });

  it('touches nothing when there is nothing to change', async () => {
    const target = layer();

    applyStyleLayerChanges(target as unknown as __esri.VectorTileLayer, {});
    await Promise.resolve();
    await Promise.resolve();

    expect(target.setStyleLayerVisibility).not.toHaveBeenCalled();
    expect(target.setPaintProperties).not.toHaveBeenCalled();
  });
});
