// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { EventPopups } from '../modules/popups/popups';
import { FishCampColdLayerSources } from './fish-camp.definitions';
import { GamesOfTexasColdLayerSources } from './games-of-texas.definitions';
import { MoveInColdLayerSources } from './move-in.definitions';
import { TailgatingColdLayerSources, TAILGATING_LAYERS } from './tailgating.definitions';
import { TCampColdLayerSources } from './t-camp.definitions';
import { VendorParkingColdLayerSources } from './vendor-parking.definitions';

function flatten(sources: LayerSource[]): LayerSource[] {
  return sources.flatMap((s) => [s, ...flatten((s as { sources?: LayerSource[] }).sources ?? [])]);
}

/** Each different popup the map's layers show, once. */
function popups(sources: LayerSource[]): unknown[] {
  const seen = new Map<string, unknown>();

  for (const s of flatten(sources).filter((s) => s.popupData)) {
    expect(s.popupComponent).toBe(EventPopups.MarkdownPopupComponent);
    seen.set(JSON.stringify(s.popupData), s.popupData);
  }

  return [...seen.values()];
}

const pair = (name: unknown, description: unknown) => ({ name, description });
const field = (name: string) => ({ field: name });

/**
 * Five maps each declared their own markdown popup helper, and Tailgating a copy of the Construction map's
 * project fields (#2602). These hold every popup to exactly what it showed before they were shared.
 */
describe('markdown popups', () => {
  it.each<[string, LayerSource[], unknown[]]>([
    ['Fish Camp', FishCampColdLayerSources, [pair(field('name'), field('description'))]],
    ['T-Camp', TCampColdLayerSources, [pair(field('name'), field('description'))]],
    [
      'Games of Texas',
      GamesOfTexasColdLayerSources,
      [pair(field('name'), field('description')), pair(field('edited'), field('description'))]
    ],
    [
      'Move-In',
      MoveInColdLayerSources,
      [pair(field('Type'), field('note')), pair(field('LotName'), field('note')), pair(field('Name'), field('note'))]
    ],
    [
      'Vendor Parking',
      VendorParkingColdLayerSources,
      [pair({ field: 'GIS.TS.ParkingLots.Name', collapsed: true }, { field: 'GIS.TS.Lot_Notes.VendorN', collapsed: true })]
    ]
  ])('%s shows the same popups', (_map, sources, expected) => {
    expect(popups(sources)).toEqual(expect.arrayContaining(expected));
    expect(popups(sources)).toHaveLength(expected.length);
  });

  it("Tailgating's Construction popup reads the project the Construction map does", () => {
    const construction = flatten(TailgatingColdLayerSources).find((s) => s.id === TAILGATING_LAYERS.CONSTRUCTION);

    expect(construction?.popupData).toMatchObject({
      projectName: { field: 'name', collapsed: true },
      startDate: { field: 'startdate', collapsed: true, format: 'date' },
      endDate: { field: 'enddate', collapsed: true, format: 'date' },
      name: '{attributes.projectName}',
      description: `<strong>Start Date:</strong> {attributes.startDate}<br><strong>End Date:</strong> {attributes.endDate}`
    });
  });
});
