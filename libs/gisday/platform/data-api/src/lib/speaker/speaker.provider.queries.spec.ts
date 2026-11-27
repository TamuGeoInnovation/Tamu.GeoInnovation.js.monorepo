import { DataSource, Repository } from 'typeorm';

import { Event, Organization, SeasonDay, Speaker, University } from '../entities/all.entity';
import {
  answering,
  loadedSeason,
  queryCheckingDataSource,
  queryCheckingRepository,
  recordWrites
} from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { OldFormatSpeaker, SpeakerProvider } from './speaker.provider';

// The provider's queries as typeorm builds them, with the real entities. speaker.provider.spec.ts mocks the repositories,
// so it cannot see a query typeorm itself refuses, such as a loaded row with a null column passed as a where value (#2363).

/** The season's one day, with an event, as the speaker queries see it. */
const seasonDays = () => [
  Object.assign(new SeasonDay(), { guid: 'd-1', date: new Date('2026-11-18T06:00:00Z'), events: [{ guid: 'e-1' }] })
];

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
      findOne: async () => loadedSeason({ days: seasonDays() }),
      findOneActive: async () => loadedSeason({ days: seasonDays() }),
      findOneWithDaysAndEvents: async () => loadedSeason({ days: seasonDays() })
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

  /** The SQL of every speaker find a call makes, as typeorm builds it. */
  function speakerQueries() {
    const queries: Array<string> = [];
    const find = speakerRepo.find.bind(speakerRepo);
    speakerRepo.find = async (options) => (
      queries.push(
        speakerRepo
          .createQueryBuilder()
          .setFindOptions(options ?? {})
          .getQuery()
      ),
      find(options)
    );

    return queries;
  }

  // The public season list (`GET speakers/season/:guid`) must not name a session hidden from the public schedule, so it
  // does not load a speaker's sessions; only the admin list's own route does (#441).
  it("lists a season's speakers without their sessions, for the public pages", async () => {
    const queries = speakerQueries();

    await provider.getSpeakersForSeason('s-1');

    expect(queries).toHaveLength(1);
    expect(queries[0]).not.toMatch(/"event_speakers"|JOIN "events"/);
  });

  // The admin Speakers list's own route, behind update:speakers, shows each speaker's sessions that season, so a speaker
  // copied into a season with no session there can be told from one who speaks (#441, #439).
  it("lists a season's speakers with the sessions they are in, for the admin list", async () => {
    const queries = speakerQueries();

    await provider.getSpeakersForSeason('s-1', true);
    await provider.getSpeakersForActiveSeason(true);

    expect(queries).toHaveLength(2);

    for (const query of queries) {
      expect(query).toMatch(/JOIN "event_speakers"/);
      expect(query).toMatch(/JOIN "events"/);
    }
  });

  // The admin list filters speakers by the tags of the sessions they are in (#440), so its own route brings each
  // session's tags; the public list, which brings no sessions, brings no tags either.
  it("brings each session's tags for the admin list only (#440)", async () => {
    const queries = speakerQueries();

    await provider.getSpeakersForSeason('s-1', true);
    await provider.getSpeakersForSeason('s-1');

    expect(queries).toHaveLength(2);
    expect(queries[0]).toMatch(/JOIN "event_tags"/);
    expect(queries[0]).toMatch(/JOIN "tags"/);
    expect(queries[1]).not.toMatch(/"event_tags"|JOIN "tags"/);
  });

  it('finds a presenter with their events in day and time order', async () => {
    await expect(provider.getPresenter('sp-1')).resolves.toBeNull();
  });

  // #3345: the presenter's page is public, and a hidden session is hidden there too, by name.
  it("names none of a presenter's hidden sessions", async () => {
    answering(speakerRepo, 'findOne', {
      ...loadedSpeaker(),
      events: [
        Object.assign(new Event(), { guid: 'e-1', name: 'Made-up Talk', active: true }),
        Object.assign(new Event(), { guid: 'e-2', name: 'Made-up Hidden Workshop', active: false })
      ]
    });

    const presenter = await provider.getPresenter('sp-1');

    expect(presenter.events.map((e) => e.name)).toEqual(['Made-up Talk']);
    expect(JSON.stringify(presenter)).not.toContain('Made-up Hidden Workshop');
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

    await expect(
      provider.applySelfEdit('sp-1', { description: 'A bio', university: { guid: 'u-1' } })
    ).resolves.toMatchObject({
      description: 'A bio'
    });
  });
});
