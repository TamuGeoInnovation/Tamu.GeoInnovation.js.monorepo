import { DataSource, Repository } from 'typeorm';

import { Event, Organization, Season, SeasonDay, Speaker, University } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { OldFormatSpeaker, SpeakerProvider } from './speaker.provider';

// The provider's queries as typeorm builds them, with the real entities. speaker.provider.spec.ts mocks the repositories,
// so it cannot see a query typeorm itself refuses, such as a loaded row with a null column passed as a where value (#2363).

/** Builds the query as the query-checking repository does, then answers with `value`, as a database holding it would. */
function answering<T extends object>(repo: Repository<T>, method: 'find' | 'findOne', value: unknown) {
  const build = repo[method].bind(repo) as (options?: unknown) => Promise<unknown>;
  (repo as unknown as Record<string, unknown>)[method] = async (options?: unknown) => (await build(options), value);
}

/** A season as the API loads it: the deadlines nobody has set come back null. */
const loadedSeason = () =>
  Object.assign(new Season(), {
    guid: 's-1',
    year: 2026,
    active: true,
    posterSubmissionsCloseAt: null,
    paperSubmissionsCloseAt: null,
    competitions: [],
    days: [Object.assign(new SeasonDay(), { guid: 'd-1', date: new Date('2026-11-18T06:00:00Z'), events: [{ guid: 'e-1' }] })]
  });

/** A speaker as the API loads them: most columns are optional and come back null. */
const loadedSpeaker = () =>
  Object.assign(new Speaker(), {
    guid: 'sp-1',
    firstName: 'Ana',
    lastName: null,
    email: null,
    isActive: null,
    isOrganizer: false,
    description: null,
    accountGuid: null,
    badgePrintedAt: null,
    badgePrintedText: null,
    created: new Date('2026-01-05T15:00:00.123Z'),
    updated: new Date('2026-01-05T15:00:00.123Z'),
    images: [],
    organization: null,
    university: null
  });

describe('SpeakerProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: SpeakerProvider;
  let speakerRepo: Repository<Speaker>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    // Updates go through a query runner, which records them instead of sending them.
    recordWrites(dataSource);
    // A copied speaker is saved through the entity's own repository.
    Speaker.useDataSource(dataSource);

    const seasons = {
      findOne: async () => loadedSeason(),
      findOneActive: async () => loadedSeason(),
      findOneWithDaysAndEvents: async () => loadedSeason()
    } as unknown as SeasonService;

    speakerRepo = queryCheckingRepository(dataSource, Speaker);
    provider = new SpeakerProvider(
      speakerRepo,
      queryCheckingRepository(dataSource, University),
      queryCheckingRepository(dataSource, Organization),
      queryCheckingRepository(dataSource, Event),
      null as unknown as AssetsService,
      seasons
    );
  });

  it("lists a season's speakers by name", async () => {
    await expect(provider.getSpeakersForSeason('s-1')).resolves.toEqual([]);
  });

  it('finds a presenter with their events in day and time order', async () => {
    await expect(provider.getPresenter('sp-1')).resolves.toBeNull();
  });

  it("lists the speakers in the active season's events", async () => {
    await expect(provider.getSpeakersForActiveSeasonInEvents(true)).resolves.toEqual([]);
  });

  it("lists the speakers in a season's events", async () => {
    await expect(provider.getSpeakersForSeasonInEvents('s-1')).resolves.toEqual([]);
  });

  it('lists every presenter by last name', async () => {
    await expect(provider.getPresenters()).resolves.toEqual([]);
  });

  it("lists a season's organizers", async () => {
    await expect(provider.getOrganizersForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's organizers", async () => {
    await expect(provider.getOrganizersForActiveSeason()).resolves.toEqual([]);
  });

  it('lists every organizer there has been', async () => {
    await expect(provider.getAllTimeOrganizers()).resolves.toEqual([]);
  });

  it('updates a speaker from the admin form', async () => {
    answering(speakerRepo, 'findOne', loadedSpeaker());

    await expect(provider.updateWithInfo('sp-1', { firstName: 'Ana' })).resolves.toMatchObject({ guid: 'sp-1' });
  });

  it("marks speakers' badges printed", async () => {
    await expect(provider.markBadgesPrinted([{ guid: 'sp-1', text: 'Ana' }])).resolves.toEqual({ marked: 0 });
  });

  it("clears speakers' printed badges", async () => {
    await expect(provider.clearBadgesPrinted(['sp-1'])).resolves.toEqual({ cleared: 0 });
  });

  it('copies speakers into another season', async () => {
    answering(speakerRepo, 'find', [loadedSpeaker()]);

    await expect(provider.copySpeakersIntoSeason('s-1', ['sp-1'])).resolves.toHaveLength(1);
  });

  it('adds speakers in bulk, with their organizations and universities', async () => {
    const speaker = {
      SpeakerFirstName: 'Ana',
      SpeakerLastName: 'Ruiz',
      SpeakerEmail: 'ana@example.com',
      SpeakerOrganization: 'An organization',
      isActive: 1,
      tamuYear: null,
      tamuDegree: null,
      tamuProgram: null,
      affiliation: null,
      description: null,
      university: 'A university',
      hexColor: ''
    } as unknown as OldFormatSpeaker;

    await expect(provider.insertBulk([speaker])).resolves.toMatchObject({ newSpeakers: [{ email: 'ana@example.com' }] });
  });

  it("applies a speaker's approved self-edit", async () => {
    answering(speakerRepo, 'findOne', loadedSpeaker());

    await expect(provider.applySelfEdit('sp-1', { description: 'A bio', university: { guid: 'u-1' } })).resolves.toMatchObject({
      description: 'A bio'
    });
  });
});
