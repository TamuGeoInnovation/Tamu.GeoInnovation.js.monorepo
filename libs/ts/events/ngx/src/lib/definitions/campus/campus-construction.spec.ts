// The definitions, their popups and the settings service import one another. Loading the service first is the
// order the application loads them in.
import '../../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';
import { CONSTRUCTION_HATCH_RENDERER } from '@tamu-gisc/maps/esri';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { FORT_WORTH_LAW_LAYERS, FortWorthLawLayerSources } from './fort-worth-law.definitions';
import { HOUSTON_SPACE_INSTITUTE_LAYERS, HoustonSpaceInstituteLayerSources } from './houston-space-institute.definitions';

/**
 * Fort Worth Law School and Houston Space Institute draw construction as College Station does (#2532): the tiles'
 * construction fill and outline are hidden, and the construction is drawn over the tiles from the campus's own
 * feature service with the shared orange grid and black outline. The translucent orange wash that replaced their pink
 * in #2506 is gone with it, so the same thing is not drawn two ways.
 */
const cases: Array<[string, LayerSource[], string, string, string]> = [
  [
    'Fort Worth Law School',
    FortWorthLawLayerSources,
    FORT_WORTH_LAW_LAYERS.BASEMAP,
    'Construction',
    `${Connections.fortWorthLawFeatureServerUrl}/1`
  ],
  [
    'Houston Space Institute',
    HoustonSpaceInstituteLayerSources,
    HOUSTON_SPACE_INSTITUTE_LAYERS.BASEMAP,
    'GIS.FCOR.HSI_Construction',
    `${Connections.houstonSpaceInstituteFeatureServerUrl}/5`
  ]
];

describe.each(cases)('%s construction (#2532)', (_, sources, basemapId, styleLayer, constructionUrl) => {
  const basemap = sources.find((source) => source.id === basemapId) as LayerSource & {
    hiddenStyleLayers?: string[];
    styleLayerPaint?: Record<string, Record<string, unknown>>;
  };
  const construction = sources.find((source) => source.url === constructionUrl) as
    | (LayerSource & { native?: { renderer?: unknown } })
    | undefined;

  it("hides the tiles' construction fill and their outline, which a layer above the tiles cannot keep whole", () => {
    expect(basemap.hiddenStyleLayers).toEqual([`${styleLayer}/1`, `${styleLayer}/0`]);
  });

  it('no longer repaints the fill as a wash', () => {
    expect(basemap.styleLayerPaint).toBeUndefined();
  });

  it("draws the construction from the campus's feature service with the shared hatch, over the tiles", () => {
    expect(construction).toBeDefined();
    expect(construction?.native?.renderer).toBe(CONSTRUCTION_HATCH_RENDERER);
    // An event map adds its sources so that the first draws on top.
    expect(sources.indexOf(construction as LayerSource)).toBeLessThan(sources.indexOf(basemap));
  });
});
