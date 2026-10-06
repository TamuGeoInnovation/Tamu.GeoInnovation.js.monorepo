import { LayerSource } from '@tamu-gisc/common/types';

import {
  FootballParkingColdLayerSources,
  FootballParkingConfiguration,
  FootballParkingOptions
} from './football-parking.definitions';

/**
 * The Football micromobility maps follow their services (#996).
 *
 * Transportation changed `FBike_entry` and `FBike_exit`: the entry service gained an `Entry Routes`
 * layer and its bike lane markings were removed. Nothing here read the new layer, so a cyclist
 * arriving at the game was shown where to park and where to dismount and no way to reach either.
 *
 * Asserted against the layer ids the services publish, written out, because the point is that the
 * declaration and the service agree. Deriving the list from the service at runtime would make these
 * assertions unnecessary and is the larger piece of work in #1028.
 */
const ENTRY_SERVICE = 'FBike_entry/FeatureServer';
const EXIT_SERVICE = 'FBike_exit/FeatureServer';

const micromobility = FootballParkingColdLayerSources.filter((source) =>
  [
    'football-micromobility-parking',
    'football-micromobility-entry-routes',
    'football-micromobility-exit-routes',
    'football-bike-dismount-zones',
    'football-bike-veo-geofence'
  ].includes(source.id)
);

const byId = (id: string): LayerSource | undefined => micromobility.find((source) => source.id === id);

/** Every layer effect declared across the builder steps, flattened. */
const layerEffects = FootballParkingOptions.flatMap((option) => option.effects?.layers ?? []);

describe('football micromobility layers', () => {
  it('declares every layer the two services publish, in the order they publish them', () => {
    // The services publish: entry 0 Micromobility Parking Area, 1 Entry Routes, 3 Bike Dismount
    // Zones, 4 Bike Veo Geofence; exit 0, 2 Exit Routes, 3, 4. Read on 6 October 2026.
    expect(micromobility.map((source) => source.id)).toEqual([
      'football-micromobility-parking',
      'football-micromobility-entry-routes',
      'football-micromobility-exit-routes',
      'football-bike-dismount-zones',
      'football-bike-veo-geofence'
    ]);
  });

  it('orders the layer list by the declaration, not alphabetically', () => {
    // Declaring the layers in service order achieves nothing on its own: the layer list sorts by
    // title unless a map asks otherwise, which is why the entry map read Bike Dismount Zones, Bike
    // Veo Geofence, Micromobility Parking Area while the legend below it read the reverse (#996).
    expect(FootballParkingConfiguration.referenceLayerListOrder).toBe('source');
  });

  it('reads each route layer from the service and sublayer that publishes it', () => {
    expect(byId('football-micromobility-entry-routes')?.url).toContain(`${ENTRY_SERVICE}/1`);
    expect(byId('football-micromobility-exit-routes')?.url).toContain(`${EXIT_SERVICE}/2`);
  });

  it('names each layer as its service names it', () => {
    expect(byId('football-micromobility-parking')?.title).toBe('Micromobility Parking Area');
    expect(byId('football-micromobility-entry-routes')?.title).toBe('Entry Routes');
    expect(byId('football-micromobility-exit-routes')?.title).toBe('Exit Routes');
    expect(byId('football-bike-dismount-zones')?.title).toBe('Bike Dismount Zones');
    expect(byId('football-bike-veo-geofence')?.title).toBe('Bike Veo Geofence');
  });

  it('carries no renderer of its own, so the services decide how these draw', () => {
    // The route layers used to be re-coloured here, from the days when every route service published
    // a flat green line. Both now publish their own purple line, so a symbology change made in
    // ArcGIS reaches the map without a release.
    for (const source of micromobility) {
      expect((source as { native?: { renderer?: unknown } }).native?.renderer).toBeUndefined();
    }
  });

  it('offers no Bike Lanes layer, which the service no longer publishes', () => {
    expect(FootballParkingColdLayerSources.find((source) => source.id === 'football-bike-lanes')).toBeUndefined();
    expect(FootballParkingColdLayerSources.find((source) => source.title === 'Bike Lanes')).toBeUndefined();
  });

  it('shows the entry routes on the entry map and the exit routes on the exit map', () => {
    // Each route layer belongs to one direction, and the other direction hides it. Without the entry
    // rule the entry routes would have drawn on both maps, which is the mirror of the bug.
    const entry = layerEffects.filter((effect) => effect.layerId === 'football-micromobility-entry-routes');
    const exit = layerEffects.filter((effect) => effect.layerId === 'football-micromobility-exit-routes');

    expect(entry.length).toBeGreaterThan(0);
    expect(exit.length).toBeGreaterThan(0);

    const inputs = (effects: typeof entry) => effects.flatMap((effect) => effect.conversions.map((c) => c.input));

    expect(inputs(entry)).toContain('micromobility');
    expect(inputs(entry)).toContain('exit');
    expect(inputs(exit)).toContain('micromobility');
    expect(inputs(exit)).toContain('entry');
  });
});
