// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { DiningKioskLayerSources } from './dining.definitions';

/**
 * The Dining map draws dining locations with their icons (#1576).
 *
 * The layer is a GeoJSON feed, which carries no symbology. Without a renderer of its own ArcGIS draws a
 * plain default marker, which is what #1526 left when it deleted this one.
 */
describe('Dining kiosk layer symbology', () => {
  it.each(DiningKioskLayerSources.filter((s) => s.type === 'geojson').map((s) => [s.id, s]))(
    'gives the GeoJSON layer %s a renderer',
    (_id, source) => {
      expect((source.native as { renderer?: unknown })?.renderer).toBeDefined();
    }
  );
});
