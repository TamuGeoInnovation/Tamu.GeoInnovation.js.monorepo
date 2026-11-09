import { LayerSource } from '@tamu-gisc/common/types';

import { DEVELOPMENT_ONLY_LAYER_SOURCES } from '../development-only-sources';
import { factory } from '../utils/definitionFactory';

const MICROMOBILITY = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Micromobility_Map_WFL1_view/FeatureServer';

/** The main map's Micromobility group in a build, if the build has it. */
function micromobility(build: ReturnType<typeof factory>): (LayerSource & { sources?: Array<LayerSource> }) | undefined {
  return build.LayerSources.find((source) => source.id === build.Definitions.MICROMOBILITY.layerId);
}

/**
 * Micromobility on the main campus map (#2739): the three layers of Transportation's service, which its own map draws
 * (#2712), as one entry a visitor can turn on.
 */
describe('Micromobility on the main map (#2739)', () => {
  // A development build, because the layer is left out of a production one; see below.
  it('is one group, listed and off until a visitor turns it on', () => {
    const group = micromobility(factory({ environment: 'dev' }));

    expect(group).toBeDefined();
    expect(group.type).toBe('group');
    expect(group.title).toBe('Micromobility');
    expect(group.listMode).toBe('show');
    expect(group.visible).toBe(false);
  });

  // The service is on Transportation's production host, so every environment reads the same one.
  it("holds the service's three layers, in its order, each drawn when the group is turned on", () => {
    const layers = micromobility(factory({ environment: 'dev' })).sources;

    expect(layers.map((layer) => layer.url)).toEqual([0, 1, 2].map((index) => `${MICROMOBILITY}/${index}`));
    expect(layers.every((layer) => layer.visible === true)).toBe(true);
  });

  // docs/map-layers.md: a layer's name and symbology are its service's. Corridor, Allowed Sidewalks and Facilities are
  // named well there, so nothing here overrides them, and no layer-title-overrides.json entry is needed.
  it('takes the names and symbols of its layers from the service', () => {
    const layers = micromobility(factory({ environment: 'dev' })).sources as Array<
      LayerSource & { native?: { renderer?: unknown } }
    >;

    expect(layers.map((layer) => layer.title)).toEqual([undefined, undefined, undefined]);
    expect(layers.map((layer) => layer.native?.renderer)).toEqual([undefined, undefined, undefined]);
  });

  it("opens a popup with the feature's own name and type", () => {
    const layers = micromobility(factory({ environment: 'dev' })).sources;

    for (const layer of layers) {
      expect(layer.popupComponent).toBeDefined();
      expect(layer.popupData).toEqual({
        name: '{attributes.name}',
        description: '<strong>Type</strong>: {attributes.notes}'
      });
    }
  });
});

/**
 * Micromobility is development-only (#2739). The service is public on Transportation's production host, so the layers
 * would work on production the moment they shipped: the gate has to be deliberate. Both sides are asserted, as for Nature
 * Rx (#2673), because a gate that hides a layer everywhere is the other way to get this wrong, and it looks like success.
 */
describe('Micromobility on the main map is development-only (#2739)', () => {
  it('is absent from a production build', () => {
    expect(micromobility(factory({ environment: 'prod' }))).toBeUndefined();
  });

  it('is present on a development build, so the work can carry on', () => {
    expect(micromobility(factory({ environment: 'dev' }))).toBeDefined();
  });

  it('is present on the local serve, which otherwise behaves as production', () => {
    expect(micromobility(factory({ environment: 'prod', includeDevelopmentOnly: true }))).toBeDefined();
  });

  it('says which issue holds it back', () => {
    const entry = DEVELOPMENT_ONLY_LAYER_SOURCES.find((source) => source.definition === 'MICROMOBILITY');

    expect(entry?.reason).toContain('#2739');
    expect(entry?.searchSources).toEqual([]);
  });
});
