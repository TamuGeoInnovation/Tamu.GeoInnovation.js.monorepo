import * as fs from 'fs';
import * as path from 'path';

import { EventDefinitions } from './all.definitions';
import { servicesOf, servicesReadOnProduction } from './production-services';

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');

/**
 * A development-only map's services are on the smoke suite's list of services production must never request
 * (#2712, #1229).
 *
 * `developmentOnly` keeps the map off production; that list is what proves it. A map marked development-only
 * whose service is not on the list would pass every check the day the gate broke.
 *
 * Except a service production reads for another map, which can never be on that list: the Sustainable Transportation
 * map's TS/BikeMap is the main map's too (#2742). Its proof is the smoke suite's check that the map's own link opens
 * the main map on production, which reads `developmentOnly` from `declared-layers.generated.json`.
 */
describe('development-only maps', () => {
  const smokeList = fs.readFileSync(path.join(REPO_ROOT, 'test', 'smoke', 'aggiemap', 'development-only.ts'), 'utf8');
  const developmentOnly = EventDefinitions.filter((definition) => definition.developmentOnly);

  // Shared with the #2753 cross-check, which carried this rule without the exemption and turned the trunk red
  // when both were on `development` (#2769).
  const onProduction = servicesReadOnProduction();

  it('include the Micromobility draft (#2712), the NCAA Volleyball map (#2713) and Sustainable Transportation (#2742)', () => {
    expect(developmentOnly.map((definition) => definition.configuration?.id)).toEqual(
      expect.arrayContaining(['micromobility', 'ncaa-volleyball', 'sustainable-transportation'])
    );
  });

  it('have every service listed in DEVELOPMENT_ONLY_SERVICES, unless production reads it for another map', () => {
    const unlisted = developmentOnly.flatMap((definition) =>
      servicesOf(definition.sources ?? [])
        .filter((service) => !onProduction.has(service) && !smokeList.includes(`'${service}'`))
        .map((service) => `${definition.configuration?.id}: ${service}`)
    );

    expect([...new Set(unlisted)]).toEqual([]);
  });
});
