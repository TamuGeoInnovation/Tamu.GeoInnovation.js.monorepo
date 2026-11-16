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
    guid: `g-${latitude}-${longitude}-${kind}`,
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
          properties: { type: 'tree_bench_plaque', typeName: 'Tree or bench memorial plaque', year: 2025, count: 1 },
          geometry: { type: 'Point', coordinates: [-96.34062, 30.61316] }
        },
        {
          type: 'Feature',
          properties: { type: 'monument', typeName: 'Monument', year: 2025, count: 1 },
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
        year: 2025,
        count: 1
      }
    ]);
  });

  /**
   * #2625: one thing found several times in 2025 is one ring, saying how many times, by the distance
   * scoring uses to call a 2026 find already found (15 m for monuments, 3 m for plaques).
   */
  describe('one point for each thing found', () => {
    const points = async () =>
      (await service.getAlreadyFoundForActiveSeason('json')) as unknown as Array<{
        latitude: number;
        longitude: number;
        type: string;
        count: number;
      }>;

    it('counts finds of a type within its distance of the first as one, at the first', async () => {
      // About 4 m and 11 m north of the first, within a monument's 15 m.
      earlier = [
        found2025(30.6122, -96.3414, 'statues_monuments'),
        found2025(30.61224, -96.3414, 'statues_monuments'),
        found2025(30.6123, -96.3414, 'statues_monuments')
      ];

      expect(await points()).toEqual([
        expect.objectContaining({ latitude: 30.6122, longitude: -96.3414, type: 'monument', count: 3 })
      ]);
    });

    it("uses each type's own distance: plaques 4 m apart are two", async () => {
      earlier = [
        found2025(30.61316, -96.34062, 'tree_bench_plaque'),
        found2025(30.61318, -96.34062, 'tree_bench_plaque'), // About 2 m: the same plaque.
        found2025(30.6132, -96.34062, 'tree_bench_plaque') // About 4.5 m: the next one.
      ];

      expect((await points()).map(({ latitude, count }) => ({ latitude, count }))).toEqual([
        { latitude: 30.61316, count: 2 },
        { latitude: 30.6132, count: 1 }
      ]);
    });

    it('does not count a plaque with a monument beside it', async () => {
      earlier = [found2025(30.6122, -96.3414, 'statues_monuments'), found2025(30.6122, -96.3414, 'tree_bench_plaque')];

      expect((await points()).map(({ type, count }) => ({ type, count }))).toEqual([
        { type: 'monument', count: 1 },
        { type: 'tree_bench_plaque', count: 1 }
      ]);
    });

    it('compares only with the first find of each thing, so a row does not chain into one', async () => {
      // Each about 11 m north of the one before: the second is within 15 m of the first, the third is not.
      earlier = [
        found2025(30.612, -96.3414, 'statues_monuments'),
        found2025(30.6121, -96.3414, 'statues_monuments'),
        found2025(30.6122, -96.3414, 'statues_monuments')
      ];

      expect((await points()).map(({ latitude, count }) => ({ latitude, count }))).toEqual([
        { latitude: 30.612, count: 2 },
        { latitude: 30.6122, count: 1 }
      ]);
    });

    it('asks for the finds oldest first, so each is counted at the place it was first found', async () => {
      await points();

      expect(find).toHaveBeenCalledWith(expect.objectContaining({ order: { created: 'ASC', guid: 'ASC' } }));
    });
  });
});
