import { LayerSource } from '@tamu-gisc/common/types';
import { factory } from '@tamu-gisc/aggiemap/ngx/common';

import { EventDefinitions } from './all.definitions';

/**
 * Which GIS services production actually reads, so that "development-only" can be checked without lying about
 * shared services (#2769).
 *
 * A development-only map is normally proven by its services being on the smoke suite's `DEVELOPMENT_ONLY_SERVICES`,
 * the list of what production must never request. **That cannot work when production reads the same service for a
 * different map.** The Sustainable Transportation map (#2742) is development-only and reads `TS/BikeMap`, which the
 * main map reads on production too, so `TS/BikeMap` can never go on that list.
 *
 * Such a map is proven instead by the smoke check that its own route lands under `/map` on production.
 *
 * This lived in `development-only-maps.spec.ts` alone, and the cross-check added by #2753 carried the same rule
 * *without* the exemption - so the two disagreed the moment both were on `development`, and the trunk went red
 * (#2769). One definition, used by both.
 */

/** A source's service, as the smoke suite names one: `Hosted/<name>/FeatureServer`. */
export const serviceOf = (url: string): string | undefined => url.match(/[^/]+\/[^/]+\/(Feature|Map)Server/)?.[0];

/** Every service a set of sources reads, groups' children included. */
export const servicesOf = (sources: LayerSource[]): string[] =>
  sources.flatMap((source) => [
    ...('url' in source && serviceOf(String(source.url)) ? [serviceOf(String(source.url)) as string] : []),
    ...servicesOf((source as { sources?: LayerSource[] }).sources ?? [])
  ]);

/** The services production reads: the main map's production build, and every map that is not development-only. */
export const servicesReadOnProduction = (): Set<string> =>
  new Set([
    ...servicesOf(factory({ environment: 'prod' }).LayerSources),
    ...EventDefinitions.filter((definition) => !definition.developmentOnly).flatMap((definition) =>
      servicesOf(definition.sources ?? [])
    )
  ]);
