import { DCBushSchoolLayerSources } from './dc-bush-school.definitions';
import { GalvestonLayerSources } from './galveston.definitions';
import { McAllenLayerSources } from './mcallen.definitions';

/**
 * A satellite campus map's click overlay draws no labels (#1283).
 *
 * The overlay is a near-invisible `FeatureLayer` that exists only so a click on a building opens its
 * popup; the vector tile basemap labels the buildings. Left to its service's labelling, the DC overlay
 * drew `F002 CONCAT NEWLINE CONCAT TAMUDC` over the building, because the service labels with an
 * ArcMap-era expression this API prints literally. McAllen's overlay drew its service's `[Abbrev]` labels on
 * top of the basemap's own, doubling them. Galveston's service has no labelling today, which is exactly
 * why this checks every campus rather than the ones that showed it.
 */
const CAMPUSES = {
  'DC / Bush School': DCBushSchoolLayerSources,
  Galveston: GalvestonLayerSources,
  McAllen: McAllenLayerSources
};

describe('campus click overlays', () => {
  for (const [campus, sources] of Object.entries(CAMPUSES)) {
    const overlays = sources.filter((source) => source.type === 'feature');

    it(`${campus} has a click overlay`, () => {
      expect(overlays.length).toBeGreaterThan(0);
    });

    for (const overlay of overlays) {
      it(`${campus}'s ${overlay.title} draws no labels`, () => {
        expect((overlay.native as { labelsVisible?: boolean } | undefined)?.labelsVisible).toBe(false);
      });
    }
  }
});
