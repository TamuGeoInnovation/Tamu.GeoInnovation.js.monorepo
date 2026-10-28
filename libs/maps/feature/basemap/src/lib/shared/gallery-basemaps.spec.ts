import { BaseLayerConstructors } from '@tamu-gisc/maps/esri';

import { AggiemapVectorBasemap, aggiemapGalleryBasemaps } from './basemaps.definition';
import { makeGalleryBasemap } from './gallery-basemaps';

import esri = __esri;

/**
 * Switching to another basemap and back must give the basemap the map opened with (#2536).
 *
 * The gallery makes its own copy of each campus basemap, and the first time it made one without the definition's
 * `hiddenStyleLayers` and without its second layer, so the published pink construction sprite came back as soon as
 * a visitor chose the raster basemap and then the vector one. #2479 fixed it and #2486 reverted it with something
 * else, and nothing noticed, because nothing compared the copy with the original.
 */
describe('the gallery copy of a campus basemap', () => {
  class Made {
    constructor(
      public readonly kind: string,
      public readonly props: Record<string, unknown>
    ) {}
  }

  const hidden: Array<{ layer: Made; ids: string[] }> = [];

  // Functions, not arrows: the code calls them with `new`, and Vitest constructs a mock's implementation.
  const constructors = {
    TileLayer: vi.fn(function (props) {
      return new Made('tile', props);
    }),
    VectorTileLayer: vi.fn(function (props) {
      const layer = new Made('vector-tile', props) as Made & { when: unknown; setStyleLayerVisibility: unknown };

      layer.when = (callback: () => void) => {
        callback();

        return Promise.resolve();
      };
      layer.setStyleLayerVisibility = (id: string) => {
        const entry = hidden.find((h) => h.layer === layer) ?? { layer, ids: [] };

        if (!hidden.includes(entry)) {
          hidden.push(entry);
        }

        entry.ids.push(id);
      };

      return layer;
    }),
    WMSLayer: vi.fn(function (props) {
      return new Made('wms', props);
    }),
    FeatureLayer: vi.fn(function (props) {
      return new Made('feature', props);
    })
  } as unknown as BaseLayerConstructors;

  class FakeBasemap {
    public readonly baseLayers: Made[];
    public readonly id: string;

    constructor(properties: { id: string; baseLayers: Made[] }) {
      this.id = properties.id;
      this.baseLayers = properties.baseLayers;
    }
  }

  const copyOf = (definition: Parameters<typeof makeGalleryBasemap>[0]) =>
    makeGalleryBasemap(definition, FakeBasemap as unknown as typeof esri.Basemap, constructors) as unknown as FakeBasemap;

  beforeEach(() => {
    hidden.length = 0;
  });

  it('carries every base layer of the definition, not only the first', () => {
    const copy = copyOf(AggiemapVectorBasemap);

    expect(AggiemapVectorBasemap.baseLayers.length).toBeGreaterThan(1);
    expect(copy.baseLayers.map((layer) => layer.kind)).toEqual(AggiemapVectorBasemap.baseLayers.map((layer) => layerKind(layer.type)));
  });

  it('hides the style layers the definition hides', () => {
    const copy = copyOf(AggiemapVectorBasemap);
    const tiles = copy.baseLayers[0];
    const expected = (AggiemapVectorBasemap.baseLayers[0] as unknown as { hiddenStyleLayers: string[] }).hiddenStyleLayers;

    expect(expected.length).toBeGreaterThan(0);
    return Promise.resolve().then(() => {
      expect(hidden.find((h) => h.layer === tiles)?.ids).toEqual(expected);
    });
  });

  it('does not hand the layer classes the layer type, or the properties that are ours', () => {
    const copy = copyOf(AggiemapVectorBasemap);

    copy.baseLayers.forEach((layer) => {
      expect(layer.props).not.toHaveProperty('type');
      expect(layer.props).not.toHaveProperty('hiddenStyleLayers');
    });
  });

  it('makes every campus basemap of the gallery the way the map made it, on both environments', () => {
    for (const isTesting of [true, false]) {
      for (const definition of aggiemapGalleryBasemaps(isTesting)) {
        const copy = copyOf(definition);

        expect(copy.id).toBe((definition as { id?: string }).id);
        expect(copy.baseLayers.map((layer) => layer.kind), definition.id as string).toEqual(
          definition.baseLayers.map((layer) => layerKind(layer.type))
        );
      }
    }
  });
});

function layerKind(type: string): string {
  return { TileLayer: 'tile', VectorTileLayer: 'vector-tile', WMSLayer: 'wms', FeatureLayer: 'feature' }[type] as string;
}
