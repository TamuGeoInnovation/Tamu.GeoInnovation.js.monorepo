import * as fs from 'fs';
import * as path from 'path';

import { EventDefinitions } from './all.definitions';

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');

/**
 * A development-only map's services are on the smoke suite's list of services production must never request
 * (#2712, #1229).
 *
 * `developmentOnly` keeps the map off production; that list is what proves it. A map marked development-only
 * whose service is not on the list would pass every check the day the gate broke.
 */
describe('development-only maps', () => {
  const smokeList = fs.readFileSync(path.join(REPO_ROOT, 'test', 'smoke', 'aggiemap', 'development-only.ts'), 'utf8');
  const developmentOnly = EventDefinitions.filter((definition) => definition.developmentOnly);

  /** A source's service, as the smoke list names one: `Hosted/<name>/FeatureServer`. */
  const serviceOf = (url: string) => url.match(/[^/]+\/[^/]+\/(Feature|Map)Server/)?.[0];

  it('include the Micromobility draft (#2712)', () => {
    expect(developmentOnly.map((definition) => definition.configuration?.id)).toContain('micromobility');
  });

  it('have every service listed in DEVELOPMENT_ONLY_SERVICES', () => {
    const unlisted = developmentOnly.flatMap((definition) =>
      (definition.sources ?? [])
        .map((source) => ('url' in source ? serviceOf(String(source.url)) : undefined))
        .filter((service): service is string => !!service && !smokeList.includes(`'${service}'`))
        .map((service) => `${definition.configuration?.id}: ${service}`)
    );

    expect([...new Set(unlisted)]).toEqual([]);
  });
});
