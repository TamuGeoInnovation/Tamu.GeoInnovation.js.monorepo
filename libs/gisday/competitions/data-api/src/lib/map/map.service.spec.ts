import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import { MapService } from './map.service';

/**
 * #2166: the competition map shows where things were already found in the previous season, so
 * participants look elsewhere. It is the same baseline scoring uses (#2162).
 */
describe('MapService.getAlreadyFoundForActiveSeason', () => {
  const form2026 = {
    model: [
      {
        attribute: 'memorial_type',
        isDiscriminator: true,
        options: [
          { name: 'Monument', value: 'monument', earlier: { values: ['statues_monuments'], metres: 15 } },
          { name: 'Memorial marker', value: 'memorial_marker' },
          {
            name: 'Tree or bench memorial plaque',
            value: 'tree_bench_plaque',
            earlier: { values: ['tree_bench_plaque'], metres: 3 }
          }
        ]
      }
    ]
  };
  const form2025 = { model: [{ attribute: 'art_type', isDiscriminator: true, options: [] }] };

  const found2025 = (latitude: number, longitude: number, kind: string, status?: string) => ({
    guid: `g-${latitude}`,
    userGuid: 'auth0|someone',
    value: { art_type: kind },
    location: { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5), accuracy: '0' },
    validationStatus: status ? { status, verifiedBy: 'auth0|reviewer' } : null
  });

  let earlier: Array<unknown>;
  let form: unknown;
  let find: jest.Mock;
  let service: MapService;

  beforeEach(() => {
    earlier = [];
    form = form2026;
    find = jest.fn((options) => Promise.resolve(options.where.season.guid === 'cs-2025' ? earlier : []));

    service = new MapService(
      { find } as never,
      { findOne: jest.fn(() => Promise.resolve({ guid: 's-2026', active: true })) } as never,
      {
        findOne: jest.fn(() => Promise.resolve({ guid: 'cs-2026', form, season: { year: 2026 } })),
        find: jest.fn(() =>
          Promise.resolve([
            { guid: 'cs-2025', form: form2025, season: { year: 2025 } },
            { guid: 'cs-2026', form, season: { year: 2026 } }
          ])
        )
      } as never
    );
  });

  it("gives last season's plaques and monuments as this season's types, and nothing else about them", async () => {
    earlier = [found2025(30.61316, -96.34062, 'tree_bench_plaque'), found2025(30.6122, -96.3414, 'statues_monuments')];

    const collection = await service.getAlreadyFoundForActiveSeason('geojson');

    expect(collection).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { type: 'tree_bench_plaque', typeName: 'Tree or bench memorial plaque', year: 2025 },
          geometry: { type: 'Point', coordinates: [-96.34062, 30.61316] }
        },
        {
          type: 'Feature',
          properties: { type: 'monument', typeName: 'Monument', year: 2025 },
          geometry: { type: 'Point', coordinates: [-96.3414, 30.6122] }
        }
      ]
    });
  });

  it("leaves out last season's art, its discarded submissions, and any without a location", async () => {
    earlier = [
      found2025(30.61, -96.34, 'unknown'),
      found2025(30.62, -96.34, 'tree_bench_plaque', COMPETITION_VALIDATION_STATUS.discarded),
      { ...found2025(30.63, -96.34, 'tree_bench_plaque'), location: { latitude: '0', longitude: '0' } },
      found2025(30.64, -96.34, 'tree_bench_plaque', COMPETITION_VALIDATION_STATUS.verified)
    ];

    const collection = (await service.getAlreadyFoundForActiveSeason('geojson')) as {
      features: Array<{ geometry: unknown }>;
    };

    expect(collection.features.map((f) => f.geometry)).toEqual([{ type: 'Point', coordinates: [-96.34, 30.64] }]);
  });

  it('is empty when this season does not continue an earlier one', async () => {
    form = { model: [{ attribute: 'kind', isDiscriminator: true, options: [{ name: 'Monument', value: 'monument' }] }] };
    earlier = [found2025(30.61316, -96.34062, 'statues_monuments')];

    expect(await service.getAlreadyFoundForActiveSeason('geojson')).toEqual({ type: 'FeatureCollection', features: [] });
  });

  it('gives plain points when not asked for GeoJSON', async () => {
    earlier = [found2025(30.61316, -96.34062, 'tree_bench_plaque')];

    expect(await service.getAlreadyFoundForActiveSeason('json')).toEqual([
      {
        latitude: 30.61316,
        longitude: -96.34062,
        type: 'tree_bench_plaque',
        typeName: 'Tree or bench memorial plaque',
        year: 2025
      }
    ]);
  });
});
