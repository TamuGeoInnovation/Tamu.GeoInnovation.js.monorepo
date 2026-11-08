// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { AggieFamilyParadeLayerSources } from './aggie-family-parade.definitions';
import { AggielandSaturdayEventColdLayerSources } from './aggieland-saturday.definitions';
import { BigEventColdLayerSources } from './big-event.definitions';
import { GraduationColdLayerSources } from './graduation.definitions';
import { MusterEventColdLayerSources } from './muster.definitions';
import { SoccerParking_DevelopmentLayerSources, SoccerParkingColdLayerSources } from './soccer-parking.definitions';
import { SoftballParkingColdLayerSources } from './softball-parking.definitions';
import { SwimmingParkingColdLayerSources } from './swimming-parking.definitions';
import { IndoorTrackParkingColdLayerSources } from './indoor-track-parking.definitions';
import { OutdoorTrackParkingColdLayerSources } from './outdoor-track-parking.definitions';

/**
 * Layers whose name comes from their service, and must keep coming from it (#1523).
 *
 * A layer's name belongs to whoever publishes it (`docs/map-layers.md`). Each of these once carried a
 * `title` that restated the service's own name word for word, so the override changed nothing a visitor
 * saw and quietly guaranteed that a rename upstream would not reach the map - which is how the Men's
 * Basketball layers went on showing their old names after the service was republished (#1431).
 *
 * Transportation republished these services so that the names they publish are the names the maps were
 * already showing (#2634), which is what made the overrides removable. Each name below was checked
 * against its live service on 8 November 2026 before its override was deleted.
 *
 * **A title added back here is not a small change.** It takes the layer out of the service's control
 * again. If one is genuinely needed, write the reason beside it, as the two further down do.
 */
const TAKES_ITS_NAME_FROM_THE_SERVICE: ReadonlyArray<{ map: string; sources: LayerSource[]; layerId: string }> = [
  { map: 'Aggie Family Parade', sources: AggieFamilyParadeLayerSources, layerId: 'aggie-family-parade-pois' },
  { map: 'Big Event', sources: BigEventColdLayerSources, layerId: 'big-event-traffic' },
  { map: 'Soccer', sources: SoccerParking_DevelopmentLayerSources, layerId: 'soccer-parking-accessible-parking' },
  { map: 'Soccer (production sources)', sources: SoccerParkingColdLayerSources, layerId: 'soccer-parking-accessible-parking' },
  { map: 'Softball', sources: SoftballParkingColdLayerSources, layerId: 'softball-parking-accessible-parking' },
  { map: 'Swimming', sources: SwimmingParkingColdLayerSources, layerId: 'swimming-parking-accessible-parking' },
  { map: 'Indoor Track', sources: IndoorTrackParkingColdLayerSources, layerId: 'indoor-track-parking-accessible-parking' },
  { map: 'Outdoor Track', sources: OutdoorTrackParkingColdLayerSources, layerId: 'outdoor-track-parking-accessible-parking' }
];

function find(sources: LayerSource[], layerId: string): LayerSource | undefined {
  return sources.find((source) => source.id === layerId);
}

describe('layer names that belong to their services (#1523)', () => {
  for (const { map, sources, layerId } of TAKES_ITS_NAME_FROM_THE_SERVICE) {
    it(`${map}: ${layerId} is named by its service, not here`, () => {
      const source = find(sources, layerId);

      // A missing layer would pass a bare `toBeUndefined` on its title, so the layer is found first.
      expect(source, `${layerId} is no longer declared, so this check proves nothing`).toBeDefined();
      expect(source?.title).toBeUndefined();
    });
  }

  it('every Graduation layer is named by the service', () => {
    // All four were republished to the names the map was already showing, closures included (#2530).
    for (const source of GraduationColdLayerSources) {
      expect(source.title, `${source.id} overrides the name its service publishes`).toBeUndefined();
    }
  });
});

/**
 * The two overrides that stay, until the service's owner says which name she wants (#2634).
 *
 * These are here so that removing one is a deliberate act with a test to update, rather than something
 * that happens by accident during a sweep like the one that removed the other fourteen.
 */
describe('layer names the maps still override on purpose (#1523)', () => {
  it('Muster calls the service\'s "Traffic Flow" layer "Muster Traffic Flow"', () => {
    expect(find(MusterEventColdLayerSources, 'muster-traffic-flow')?.title).toBe('Muster Traffic Flow');
  });

  it('Aggieland Saturday shortens "Points of Interest @ Aggieland Saturday"', () => {
    expect(find(AggielandSaturdayEventColdLayerSources, 'aggieland-saturday-special-pois')?.title).toBe(
      'Special Points of Interest'
    );
  });
});
