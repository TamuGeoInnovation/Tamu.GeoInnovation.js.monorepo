/**
 * @vitest-environment-options {"url": "https://aggiemap.tamu.edu/"}
 */
import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { EventDefinitions } from './all.definitions';
import { mapSegment } from '../guards/map-address/map-address.guard';

/**
 * Every layer an event map draws from Transportation's services that hold every parking space on campus, about 45,000,
 * for the smoke suite's `parking-spaces.spec.ts` (#3824).
 *
 * Each of these services' symbology draws only some types of space, so a layer that loads the rest downloads tens of
 * thousands of points it never draws: two maps took two to four minutes to finish drawing (#1897), and two more were
 * found doing it after the check had been written for the first two by name (#3824). The smoke suite cannot import the
 * definitions, so this writes the list it checks, and fails when the definitions change without it, as
 * `declared-layers.spec.ts` does for the layer lists. A new map drawing from one of these services is checked without
 * anybody remembering to add it.
 */
/**
 * The services holding every parking space on campus, by their name in `Connections`, each with the layer that holds the
 * spaces. The maintenance and service-loading services also hold a lots layer, which is a different question.
 */
const SPACE_SERVICES = {
  accessibleParkingUrl: '0',
  motorcycleParkingUrl: '0',
  maintenanceParkingUrl: '0',
  loadingZonesUrl: '0'
} as const;

interface SpaceLayer {
  /** The map's address, as the smoke suite opens it. */
  route: string;
  /** The layer's id, as the map probe reports it. */
  layerId: string;
  /** The service, by its name in `Connections`, so the suite asks the one this environment reads. */
  service: keyof typeof SPACE_SERVICES;
  /** The layer within the service. */
  layer: string;
}

describe('parking space layers (#3824)', () => {
  it('match the list the smoke suite reads', async () => {
    const services = (Object.keys(SPACE_SERVICES) as Array<keyof typeof SPACE_SERVICES>).map((service) => ({
      service,
      layer: SPACE_SERVICES[service],
      url: `${Connections[service]}/${SPACE_SERVICES[service]}`
    }));
    const found: Array<SpaceLayer> = [];

    for (const definition of EventDefinitions) {
      const id = definition.configuration?.id;
      const layers: Array<LayerSource> = [...(definition.sources ?? []), ...(definition.developmentSources ?? [])];

      if (!id || !definition.discover) {
        continue;
      }

      for (const layer of layers) {
        const match = services.find((s) => layer.url === s.url);

        if (match && layer.id) {
          found.push({
            route: `/${mapSegment(definition.discover)}/${id}`,
            layerId: layer.id,
            service: match.service,
            layer: match.layer
          });
        }
      }
    }

    const unique = [...new Map(found.map((f) => [`${f.route} ${f.layerId}`, f])).values()].sort((a, b) =>
      `${a.route} ${a.layerId}`.localeCompare(`${b.route} ${b.layerId}`)
    );

    await expect(`${JSON.stringify(unique, null, 2)}\n`).toMatchFileSnapshot(
      '../../../../../../../test/smoke/aggiemap/space-layers.generated.json'
    );
  });
});
