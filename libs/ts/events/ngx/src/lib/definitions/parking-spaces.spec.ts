// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { AccessibleParkingColdLayerSources } from './accessible-parking.definitions';
import { MotorcycleParkingColdLayerSources } from './motorcycle-parking.definitions';

/**
 * Accessible Parking and Motorcycle Parking each draw one type of parking space from a service that
 * holds every space on campus, about 45,000 points. Their symbology draws only their own types, so
 * the rest were loaded and never drawn, and on ArcGIS 5.1 the maps took minutes to finish drawing
 * (#1897). Each layer now asks for its own spaces only.
 *
 * `parking-spaces.spec.ts` in the smoke suite checks the same thing against the deployed map: that
 * each layer holds exactly the spaces its symbology draws.
 */
describe('parking space maps', () => {
  const where = (sources: typeof AccessibleParkingColdLayerSources) =>
    sources.map((source) => (source.native as { definitionExpression?: string } | undefined)?.definitionExpression);

  it('Accessible Parking loads only accessible and visitor accessible spaces', () => {
    expect(where(AccessibleParkingColdLayerSources)).toEqual([`spc_type IN ('H/C', 'Visitor H/C')`]);
  });

  it('Motorcycle Parking loads only motorcycle spaces', () => {
    expect(where(MotorcycleParkingColdLayerSources)).toEqual([`Spc_Type = 'M/C'`]);
  });
});
