import { LayerSource } from '@tamu-gisc/common/types';

import { factory } from '../utils/definitionFactory';

/** Every layer id in a build, children included, because the groups nested theirs. */
function allLayerIds(build: ReturnType<typeof factory>): Array<string> {
  const collect = (sources: Array<LayerSource & { sources?: Array<LayerSource> }>): Array<string> =>
    sources.flatMap((source) => [
      source.id,
      ...collect((source as { sources?: Array<LayerSource> }).sources ?? [])
    ]);

  return collect(build.LayerSources);
}

const builds: Array<[string, ReturnType<typeof factory>]> = [
  ['a production build', factory({ environment: 'prod' })],
  ['a development build', factory({ environment: 'dev' })],
  ['the local serve, which otherwise behaves as production', factory({ environment: 'prod', includeDevelopmentOnly: true })]
];

/**
 * Micromobility and Sustainable Transportation came off the main campus map in #2895. Both are maps of their own,
 * reached at their own addresses and listed under Parking & Transportation, and the maintainer decided on
 * 13 November 2026 that neither should also be an entry in the main map's layer list.
 *
 * Asserted on every build rather than on production alone, because this is not a gate: there is no build that should
 * have them. Micromobility used to be development-only here, which is why this file began as the spec for that gate.
 */
describe('The transportation groups are off the main map (#2895)', () => {
  it.each(builds)('has no Micromobility group on %s', (_label, build) => {
    expect(allLayerIds(build)).not.toContain('micromobility-group-layer');
  });

  it.each(builds)('has no Sustainable Transportation group on %s', (_label, build) => {
    expect(allLayerIds(build)).not.toContain('sustainable-transportation-group-layer');
  });

  // The group was the only place these six were on the main map, so they went with it. That is the whole of what a
  // visitor loses here, and naming them is what makes putting one back a deliberate act rather than an accident.
  it.each(builds)('leaves none of the six bike and EV layers behind on %s', (_label, build) => {
    const ids = allLayerIds(build);

    for (const id of [
      'bike-dismount-zones',
      'city-bike-lanes-routes',
      'campus-bike-lanes',
      'bike-fix-stations',
      'bike-racks-map',
      'ev-charge-stations'
    ]) {
      expect(ids).not.toContain(id);
    }
  });

  // The service itself is still read - by the Micromobility map - so this is about the main map's list, not the data.
  it('still resolves the micromobility service for the map that does draw it', () => {
    expect(factory({ environment: 'prod' }).Connections.micromobilityUrl).toContain(
      'Approved_Micromobility_Paths_view/FeatureServer'
    );
  });
});
