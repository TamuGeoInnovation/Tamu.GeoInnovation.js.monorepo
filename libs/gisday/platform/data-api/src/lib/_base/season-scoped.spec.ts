import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { ClassProvider } from '../class/class.provider';
import { EventProvider } from '../event/event.provider';
import { EventBroadcastService } from '../event-broadcast/event-broadcast.service';
import { EventLocationService } from '../event-location/event-location.service';
import { OrganizationService } from '../organization/organization.service';
import { PlaceService } from '../place/place.service';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SponsorProvider } from '../sponsor/sponsor.provider';
import { TagProvider } from '../tag/tag.provider';
import { UniversityProvider } from '../university/university.provider';

/**
 * The ten season-scoped providers (#3324): their records for the active season, and copying records into a season.
 * Each wrote these itself, and fixes reached one copy each.
 */

/** A provider made bare, with `seasons` as its season service under whichever name it reads it by. */
function bare<T extends object>(type: { prototype: T }, seasons: object, repo: object = {}, more: object = {}): T {
  return Object.assign(Object.create(type.prototype), {
    seasonService: seasons,
    seasonProvider: seasons,
    ss: seasons,
    repo,
    records: repo,
    eb: repo,
    eventRepo: repo,
    orgRepo: repo,
    pRepo: repo,
    speakerRepo: repo,
    sponsorRepo: repo,
    ...more
  }) as T;
}

describe("the active season's records, on every season-scoped provider (#3324)", () => {
  // SeasonService.findOneActive throws 404 itself when there is no active season, so each provider's own
  // `throw 422 'No active season found.'` could never run. Pinned before it goes: the answer is 404.
  const none = { findOneActive: () => Promise.reject(new NotFoundException('No active season found.')) };

  it.each([
    ['ClassProvider', () => bare(ClassProvider, none).getClassesForActiveSeason()],
    ['EventProvider', () => bare(EventProvider, none).getEventsForActiveSeason()],
    ['EventBroadcastService', () => bare(EventBroadcastService, none).getBroadcastsForActiveSeason()],
    ['EventLocationService', () => bare(EventLocationService, none).getEventLocationsForActiveSeason()],
    ['OrganizationService', () => bare(OrganizationService, none).getOrganizationsForActiveSeason()],
    ['PlaceService', () => bare(PlaceService, none).getPlacesForActiveSeason()],
    ['SpeakerProvider', () => bare(SpeakerProvider, none).getSpeakersForActiveSeason()],
    ['SponsorProvider', () => bare(SponsorProvider, none).getSponsorsForActiveSeason()],
    ['TagProvider', () => bare(TagProvider, none).getTagsForActiveSeason()],
    ['UniversityProvider', () => bare(UniversityProvider, none).getEntitiesForActiveSeason()]
  ])('%s answers 404 when there is no active season', async (_name, ask) => {
    await expect(ask()).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('copying records into a season (#3324)', () => {
  // Every other provider checked the season exists and that something was found to copy; the broadcasts' copy did
  // neither, so it wrote broadcasts into a season that did not exist, and answered an empty list for guids that
  // matched nothing. Red on today's code.
  it('refuses to copy broadcasts into a season that does not exist', async () => {
    const repo = {
      find: jest.fn(async () => [{ guid: 'b-1', name: 'Made-up broadcast' }]),
      create: jest.fn((x) => ({ ...x, save: async () => x })),
      save: jest.fn(async (x) => x)
    };
    const service = bare(EventBroadcastService, { findOne: async () => null }, repo);

    await expect(service.copyBroadcastsIntoSeason('no-such-season', ['b-1'])).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('refuses to copy broadcasts when none of them is found', async () => {
    const repo = { find: jest.fn(async () => []), create: jest.fn((x) => x), save: jest.fn(async (x) => x) };
    const service = bare(EventBroadcastService, { findOne: async () => ({ guid: 's-2027' }) }, repo);

    await expect(service.copyBroadcastsIntoSeason('s-2027', ['no-such-broadcast'])).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
  });
});

/**
 * The five copies that clone nested records (#3379): events, organizations, places, speakers and sponsors. What each hands
 * to `create` is pinned on today's code, so moving them onto the shared copy is shown to copy the same thing.
 */
describe('copying records with nested records into a season (#3379)', () => {
  const season = { guid: 's-2027', year: 2027 };
  const day = { guid: 'd-1', date: '2027-11-17' };
  const stamps = { created: new Date('2026-01-01'), updated: new Date('2026-01-02') };

  /** A repository holding `records`, whose saves answer what they were given, or fail with `failure`. */
  function holding(records: Array<object>, failure?: Error) {
    const save = async (x: unknown) => (failure ? Promise.reject(failure) : x);

    return {
      find: jest.fn(async () => records),
      create: jest.fn((x) => ({ ...x, save: () => save(x) })),
      save: jest.fn(save)
    };
  }

  /** The season lookup the event copy makes: the season with its days, by date. */
  function seasonsWithDays(found: object | null) {
    const query = {
      leftJoinAndSelect: () => query,
      where: () => query,
      orderBy: () => query,
      getOne: async () => found
    };

    return { createQueryBuilder: () => query, findOne: async () => found };
  }

  type Repo = ReturnType<typeof holding>;

  const cases: Array<{
    name: string;
    record: () => object;
    copy: (repo: Repo, seasons?: object) => Promise<unknown>;
    copied: object;
  }> = [
    {
      name: 'OrganizationService',
      record: () => ({ guid: 'o-1', ...stamps, name: 'Made-up org', logos: [{ guid: 'a-1', ...stamps, path: 'o.png' }] }),
      copy: (repo, seasons = { findOne: async () => season }) =>
        bare(OrganizationService, seasons, repo).copyOrganizationsIntoSeason('s-2027', ['o-1']),
      copied: { name: 'Made-up org', logos: [{ path: 'o.png' }], season }
    },
    {
      name: 'PlaceService',
      record: () => ({
        guid: 'p-1',
        ...stamps,
        name: 'Made-up hall',
        logos: [{ guid: 'a-2', ...stamps, path: 'p.png' }],
        links: [{ guid: 'l-1', ...stamps, label: 'Map', url: 'https://example.com/map' }]
      }),
      copy: (repo, seasons = { findOne: async () => season }) =>
        bare(PlaceService, seasons, repo).copyPlacesIntoSeason('s-2027', ['p-1']),
      copied: {
        name: 'Made-up hall',
        logos: [{ path: 'p.png' }],
        links: [{ label: 'Map', url: 'https://example.com/map' }],
        season
      }
    },
    {
      name: 'SpeakerProvider',
      record: () => ({
        guid: 'sp-1',
        ...stamps,
        firstName: 'Pat',
        lastName: 'Example',
        badgePrintedAt: new Date('2026-11-10'),
        badgePrintedText: 'Pat Example',
        images: [{ guid: 'a-3', ...stamps, path: 's.png' }]
      }),
      copy: (repo, seasons = { findOne: async () => season }) =>
        bare(SpeakerProvider, seasons, repo).copySpeakersIntoSeason('s-2027', ['sp-1']),
      copied: {
        firstName: 'Pat',
        lastName: 'Example',
        badgePrintedAt: null,
        badgePrintedText: null,
        images: [{ path: 's.png' }],
        season
      }
    },
    {
      name: 'SponsorProvider',
      record: () => ({ guid: 'sn-1', ...stamps, name: 'Made-up sponsor', logos: [{ guid: 'a-4', ...stamps, path: 'l.png' }] }),
      copy: (repo, seasons = { findOne: async () => season }) =>
        bare(SponsorProvider, seasons, repo).copyEntitiesIntoSeason('s-2027', ['sn-1']),
      copied: { name: 'Made-up sponsor', logos: [{ path: 'l.png' }], season }
    },
    {
      name: 'EventProvider',
      record: () => ({
        guid: 'e-1',
        ...stamps,
        name: 'Made-up session',
        speakers: [{ guid: 'sp-1' }],
        broadcast: { guid: 'b-1' },
        location: { guid: 'el-1' },
        courseCredit: [{ guid: 'c-1' }],
        sponsors: [{ guid: 'sn-1' }],
        judges: [{ guid: 'sp-2' }],
        judgingClosed: true
      }),
      copy: (repo, seasons = seasonsWithDays({ ...season, days: [day] })) =>
        bare(EventProvider, seasons, repo, { seasonRepo: seasons }).copyEventsIntoSeason('s-2027', ['e-1']),
      copied: { name: 'Made-up session', day }
    }
  ];

  const eventCase = cases.find((c) => c.name === 'EventProvider');

  it.each(cases)('$name copies the record and its nested records without their identity', async ({ record, copy, copied }) => {
    const repo = holding([record()]);

    await copy(repo);

    expect(repo.create).toHaveBeenCalledTimes(1);
    const passed = repo.create.mock.calls[0][0];
    expect(passed).toEqual(copied);
    expect(passed.guid).toBeUndefined();
  });

  // None of the five awaited its saves, so a failed save escaped as the driver's error rather than the copy's own
  // answer. Red on today's code.
  it.each(cases)('$name answers a failed save with 422', async ({ record, copy }) => {
    await expect(copy(holding([record()], new Error('duplicate key')))).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
  });

  it.each(cases)('$name refuses with 422 when none of the records is found', async ({ copy }) => {
    await expect(copy(holding([]))).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it.each(cases.filter((c) => c !== eventCase))(
    '$name refuses with 422 to copy into a season that does not exist',
    async ({ record, copy }) => {
      await expect(copy(holding([record()]), { findOne: async () => null })).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );
    }
  );

  // The event copy answered 404 for a missing season and for no events, where every other copy answers 422.
  // Red on today's code.
  it('EventProvider refuses with 422 to copy into a season that does not exist', async () => {
    await expect(eventCase.copy(holding([eventCase.record()]), seasonsWithDays(null))).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
  });

  it('EventProvider refuses with 422 to copy into a season with no days', async () => {
    await expect(
      eventCase.copy(holding([eventCase.record()]), seasonsWithDays({ ...season, days: [] }))
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
