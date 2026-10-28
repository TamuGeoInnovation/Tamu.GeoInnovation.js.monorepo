// The definitions, their popups and the settings service import one another. Loading the service first is the
// order the application loads them in.
import '../../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { FORT_WORTH_LAW_LAYERS, FortWorthLawLayerSources } from './fort-worth-law.definitions';
import { HOUSTON_SPACE_INSTITUTE_LAYERS, HoustonSpaceInstituteLayerSources } from './houston-space-institute.definitions';

/**
 * Fort Worth Law School and Houston Space Institute fill their buildings under construction with the same opaque pink
 * sprite tile as College Station's basemap did (#2506), on production. Each basemap repaints that fill inside its own
 * style as a translucent orange, which draws under the basemap's outline, labels and buildings.
 */
const cases: Array<[string, LayerSource[], string, string]> = [
  ['Fort Worth Law School', FortWorthLawLayerSources, FORT_WORTH_LAW_LAYERS.BASEMAP, 'Construction/1'],
  [
    'Houston Space Institute',
    HoustonSpaceInstituteLayerSources,
    HOUSTON_SPACE_INSTITUTE_LAYERS.BASEMAP,
    'GIS.FCOR.HSI_Construction/1'
  ]
];

describe.each(cases)('%s construction fill (#2506)', (_, sources, basemapId, fill) => {
  const basemap = sources.find((source) => source.id === basemapId) as LayerSource & {
    styleLayerPaint?: Record<string, Record<string, unknown>>;
  };

  it('repaints the pink pattern as a translucent fill colour', () => {
    const paint = basemap.styleLayerPaint?.[fill];

    expect(paint).toBeDefined();
    expect(paint).not.toHaveProperty('fill-pattern');
    expect(paint?.['fill-color']).toMatch(/^rgba\(230, 152, 0, 0\.\d+\)$/);
  });
});
