import { MapService } from './map.service';

/**
 * #1792: the competition map's endpoints answer anyone, signed in or not, so their features must not carry
 * who reviewed each submission (`verifiedBy`, an organizer's account id), nor anything else of the review
 * record beyond its status.
 */
describe('MapService, what the public map sends', () => {
  const reviewed = (guid: string, verifiedBy: string, status: string) => ({
    guid,
    created: new Date('2026-11-15T18:00:00Z'),
    updated: new Date('2026-11-15T19:00:00Z'),
    userGuid: 'auth0|participant',
    location: { latitude: '30.61316', longitude: '-96.34062' },
    validationStatus: {
      guid: `vs-${guid}`,
      status,
      verifiedBy,
      created: new Date('2026-11-15T18:30:00Z'),
      updated: new Date('2026-11-15T18:30:00Z')
    }
  });

  let service: MapService;

  beforeEach(() => {
    const query = {
      leftJoinAndSelect: () => query,
      leftJoin: () => query,
      where: () => query,
      andWhere: () => query,
      setParameter: () => query,
      setParameters: () => query,
      orderBy: () => query,
      getMany: () =>
        Promise.resolve([
          reviewed('s-1', 'google-oauth2|reviewer-account-id', 'verified'),
          reviewed('s-2', 'automatic', 'unverified')
        ])
    };

    service = new MapService(
      { createQueryBuilder: () => query } as never,
      { findOne: () => Promise.resolve({ guid: 's-2026', active: true }) } as never,
      { findOne: () => Promise.resolve({ guid: 'cs-2026' }) } as never
    );
  });

  it.each([
    ['the active season', (s: MapService) => s.getLocationsForActiveSeason('geojson')],
    ['a season by its guid', (s: MapService) => s.getLocationsForSeasonId('cs-2026', 'geojson')],
    ["one participant's submissions", (s: MapService) => s.getUserLocationsForActiveSeason('auth0|participant', 'geojson')]
  ])('sends no reviewer for %s, only each submission and its status', async (_, load) => {
    const collection = (await load(service)) as { features: Array<{ properties: Record<string, unknown> }> };

    expect(JSON.stringify(collection)).not.toContain('reviewer-account-id');
    expect(JSON.stringify(collection)).not.toContain('verifiedBy');
    expect(collection.features.map((f) => f.properties)).toEqual([
      {
        guid: 's-1',
        status: 'verified',
        created: new Date('2026-11-15T18:00:00Z'),
        updated: new Date('2026-11-15T19:00:00Z')
      },
      {
        guid: 's-2',
        status: 'unverified',
        created: new Date('2026-11-15T18:00:00Z'),
        updated: new Date('2026-11-15T19:00:00Z')
      }
    ]);
  });
});

/**
 * #3495: a submission saved without its location has no point; the map shows the others, rather than failing with a
 * 500 for everyone.
 */
describe('MapService, a submission with no location', () => {
  it('is left out of the map, and the others are shown', async () => {
    const submissions = [
      { guid: 's-1', location: { latitude: '30.61316', longitude: '-96.34062' }, validationStatus: null },
      { guid: 's-2', location: null, validationStatus: null }
    ];
    const query = {
      leftJoinAndSelect: () => query,
      leftJoin: () => query,
      where: () => query,
      setParameter: () => query,
      orderBy: () => query,
      getMany: () => Promise.resolve(submissions)
    };
    const service = new MapService({ createQueryBuilder: () => query } as never, {} as never, {} as never);

    const collection = (await service.getLocationsForSeasonId('cs-2026', 'geojson')) as {
      features: Array<{ properties: { guid: string }; geometry: { coordinates: Array<unknown> } }>;
    };

    expect(collection.features.map((f) => [f.properties.guid, f.geometry.coordinates])).toEqual([
      ['s-1', ['-96.34062', '30.61316']]
    ]);
  });
});
