// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { FishCampColdLayerSources, FISH_CAMP_LAYERS } from './fish-camp.definitions';
import { HsGraduationColdLayerSources, HS_GRADUATION_LAYERS } from './hs-graduation.definitions';
import {
  PhysEngFestivalColdLayerSources,
  PhysEngFestDefinitions,
  PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS
} from './phys-engineering-festival.definitions';

type LineSymbol = { marker?: { style?: string } };
type Renderer = { symbol?: LineSymbol; uniqueValueInfos?: Array<{ symbol?: LineSymbol }> };

function flatten(sources: LayerSource[]): LayerSource[] {
  return sources.flatMap((s) => [s, ...flatten((s as { sources?: LayerSource[] }).sources ?? [])]);
}

function find(sources: LayerSource[], id: string): LayerSource {
  const source = flatten(sources).find((s) => s.id === id);

  expect(source).toBeDefined();

  return source as LayerSource;
}

/** Every symbol the layer's own renderer draws with, or none if it has no renderer. */
function symbols(source: LayerSource): LineSymbol[] {
  const renderer = (source.native as { renderer?: Renderer } | undefined)?.renderer;

  if (!renderer) {
    return [];
  }

  return renderer.uniqueValueInfos ? renderer.uniqueValueInfos.map((i) => i.symbol ?? {}) : [renderer.symbol ?? {}];
}

/**
 * The route lines on HS Graduation, Physics Fest and Fish Camp are drawn as arrows (#1803).
 *
 * #1526 removed their renderers, expecting each portal item to supply the authored symbol. These are
 * MapServer services whose portal items carry no symbology, and whose services publish a flattened
 * 9 to 15 pt line with no arrowheads, so the routes drew as thick blobs with no direction (#1778).
 */
describe('Event route arrows', () => {
  const PF = PHYSICS_AND_ENGINEERING_FESTIVAL_LAYERS;

  const routes: Array<[string, string, LayerSource[]]> = [
    ['HS Graduation', HS_GRADUATION_LAYERS.ARRIVAL_ROUTES, HsGraduationColdLayerSources],
    ['HS Graduation', HS_GRADUATION_LAYERS.DEPARTURE_ROUTES, HsGraduationColdLayerSources],
    ['Physics Fest', PF.GENERAL_PARKING_PEDESTRIAN_PATH, PhysEngFestivalColdLayerSources],
    ['Physics Fest', PF.EASTBOUND_BUS_ROUTE, PhysEngFestivalColdLayerSources],
    ['Physics Fest', PF.EASTBOUND_PEDESTRIAN_PATH, PhysEngFestivalColdLayerSources],
    ['Physics Fest', PF.WESTBOUND_BUS_ROUTE, PhysEngFestivalColdLayerSources],
    ['Physics Fest', PF.WESTBOUND_PEDESTRIAN_PATH, PhysEngFestivalColdLayerSources],
    ['Fish Camp', FISH_CAMP_LAYERS.ARRIVAL_ROUTES, FishCampColdLayerSources],
    ['Fish Camp', FISH_CAMP_LAYERS.DEPARTURE_ROUTES, FishCampColdLayerSources]
  ];

  it.each(routes)('%s draws %s with arrowheads', (_map, id, sources) => {
    const drawn = symbols(find(sources, id));

    expect(drawn.length).toBeGreaterThan(0);

    for (const symbol of drawn) {
      expect(symbol.marker?.style).toBe('arrow');
    }
  });
});

/**
 * Physics Fest's three groups are made in the definition, so there is no service to name them (#1803).
 * #1526 removed their titles along with the layers' own, and the legend and layer list showed them
 * with no name.
 */
describe('Physics Fest group names', () => {
  it.each([
    PhysEngFestDefinitions.GENERAL_PARKING_GROUP,
    PhysEngFestDefinitions.EASTBOUND_UNIVERSITY_GROUP,
    PhysEngFestDefinitions.WESTBOUND_UNIVERSITY_GROUP
  ].map((g) => [g.name, g.id]))('names the group %s', (name, id) => {
    expect(find(PhysEngFestivalColdLayerSources, id).title).toBe(name);
  });

  it('names the groups as they read on the map', () => {
    expect(PhysEngFestivalColdLayerSources.filter((s) => s.type === 'group').map((s) => s.title)).toEqual([
      'General Parking',
      'Buses Entering from Eastbound University Dr',
      'Buses Entering from Westbound University Dr'
    ]);
  });
});
