import * as fs from 'fs';
import * as path from 'path';

import { factory } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { EventDefinitions } from './all.definitions';

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

  /** A source's service, as the smoke list names one: `Hosted/<name>/FeatureServer`. */
  const serviceOf = (url: string) => url.match(/[^/]+\/[^/]+\/(Feature|Map)Server/)?.[0];

  /** Every service a source reads, groups' children included. */
  const servicesOf = (sources: LayerSource[]): string[] =>
    sources.flatMap((source) => [
      ...('url' in source && serviceOf(String(source.url)) ? [serviceOf(String(source.url)) as string] : []),
      ...servicesOf((source as { sources?: LayerSource[] }).sources ?? [])
    ]);

  /** The services production reads for maps that are on it: the main map, and every map not development-only. */
  const onProduction = new Set([
    ...servicesOf(factory({ environment: 'prod' }).LayerSources),
    ...EventDefinitions.filter((definition) => !definition.developmentOnly).flatMap((definition) =>
      servicesOf(definition.sources ?? [])
    )
  ]);

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
