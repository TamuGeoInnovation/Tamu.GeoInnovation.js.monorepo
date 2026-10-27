// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import {
  BASEBALL_PARKING_LAYERS,
  BaseballParking_DevelopmentLayerSources,
  BaseballParkingOptions
} from './baseball-parking.definitions';

/**
 * The baseball maps on the development server, after the service was republished (#2453).
 *
 * The republished lots layer marks two lots (100j and 102) `Reserved` rather than `Event Parking`, and the
 * symbols layer has nothing to split on, so each map has to draw every lot once, its own symbols, and the
 * accessible shuttle over the lots.
 */
const sources = BaseballParking_DevelopmentLayerSources;
const modes = ['event', 'accessible'];

function source(id: BASEBALL_PARKING_LAYERS): LayerSource | undefined {
  return sources.find((s) => s.id === id);
}

/** The layers the map-mode option turns on in this mode, among those the development map declares. */
function visibleIn(mode: string): LayerSource[] {
  const effects = BaseballParkingOptions.find((option) => option.value === 'map-mode')?.effects.layers ?? [];

  return sources.filter((s) => {
    const conversion = effects.find((effect) => effect.layerId === s.id)?.conversions?.find((c) => c.input === mode);

    return (conversion?.propOverrides?.visible ?? s.visible) !== false;
  });
}

function filterOf(s: LayerSource | undefined): string | undefined {
  return (s?.native as { definitionExpression?: string } | undefined)?.definitionExpression;
}

describe('Baseball parking on development (#2453)', () => {
  it('draws every lot, Reserved ones such as 100j included, on the parking map', () => {
    const lots = source(BASEBALL_PARKING_LAYERS.EVENT_LOTS);

    expect(lots).toBeDefined();
    expect(filterOf(lots)).toBeUndefined();
    expect(visibleIn('event')).toContain(lots);
  });

  for (const mode of modes) {
    it(`draws each lot once on the ${mode} map`, () => {
      const lotsLayers = visibleIn(mode).filter((s) => s.url?.endsWith('/3'));

      expect(lotsLayers.length).toBe(1);
    });

    it(`shows symbols on the ${mode} map`, () => {
      expect(visibleIn(mode).filter((s) => s.url?.endsWith('/0')).length).toBe(1);
    });
  }

  it('draws the accessible shuttle over the lots', () => {
    const order = sources.map((s) => s.id);
    const shuttle = order.indexOf(BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES);

    expect(shuttle).toBeGreaterThan(order.indexOf(BASEBALL_PARKING_LAYERS.EVENT_LOTS));
    expect(visibleIn('accessible').map((s) => s.id)).toContain(BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES);
  });

  it('leaves the shuttle route off the parking map', () => {
    expect(visibleIn('event').map((s) => s.id)).not.toContain(BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES);
  });
});
