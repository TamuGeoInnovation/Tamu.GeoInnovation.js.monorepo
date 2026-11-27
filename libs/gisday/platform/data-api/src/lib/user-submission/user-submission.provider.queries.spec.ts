import { DataSource, Repository } from 'typeorm';

import { Asset, Event, Season, SeasonDay, Submission, SubmissionType } from '../entities/all.entity';
import {
  answering,
  loadedSeason,
  queryCheckingDataSource,
  queryCheckingRepository,
  recordWrites
} from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { ContactService } from '../contact/contact.service';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { SeasonService } from '../season/season.service';
import { UserSubmissionProvider } from './user-submission.provider';

// The provider's queries as typeorm builds them, with the real entities. user-submission.provider.spec.ts mocks the
// repositories, so it cannot see a query typeorm itself refuses, such as a loaded row with a null column passed as a where
// value (#2363). Its season lookups go through a real SeasonService on the same repositories; emails go to a stub.

const REVIEWER = ['update:competitions', 'read:competitions', 'delete:competitions'];
const GUID = '00000000-0000-4000-8000-000000000001';

/** A submission as the API loads it: what the entrant left blank comes back null. */
const loadedSubmission = (overrides: Partial<Submission> = {}) =>
  Object.assign(new Submission(), {
    guid: GUID,
    accountGuid: 'auth0|entrant',
    title: 'A poster',
    participants: [{ name: 'Ana', email: 'ana@example.com' }],
    abstract: null,
    link: null,
    reviewed: false,
    acceptance: false,
    message: null,
    format: null,
    submissionType: 'poster',
    classificationType: null,
    created: new Date('2026-10-01T15:00:00.123Z'),
    updated: new Date('2026-10-01T15:00:00.123Z'),
    season: loadedSeason({ days: [] }),
    files: [],
    ...overrides
  });

describe('UserSubmissionProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: UserSubmissionProvider;
  let submissions: Repository<Submission>;
  let seasons: Repository<Season>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    // Updates and deletes go through a query runner, which records them instead of sending them.
    recordWrites(dataSource);

    const repo = <T extends object>(entity: new () => T) => queryCheckingRepository(dataSource, entity);
    const contact = { sendMessage: async () => undefined } as unknown as ContactService;
    const profiles = { profilesOf: async () => new Map() } as unknown as DashboardProfilesService;
    const assets = { deleteAssetFiles: async () => undefined } as unknown as AssetsService;

    submissions = repo(Submission);
    seasons = repo(Season);
    answering(seasons, 'findOne', loadedSeason({ days: [] }));

    provider = new UserSubmissionProvider(
      submissions,
      repo(SubmissionType),
      repo(Event),
      new SeasonService(seasons, repo(SeasonDay)),
      contact,
      profiles,
      assets
    );
  });

  it("lists a season's submissions with their files", async () => {
    await expect(provider.getSubmissionsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists a season's accepted posters", async () => {
    await expect(provider.getPosters('s-1')).resolves.toEqual([]);
  });

  it("lists an entrant's submissions in the active season", async () => {
    await expect(provider.getUserPresentationsForActiveSeason('auth0|entrant')).resolves.toEqual([]);
  });

  it("finds an entrant's submission with its season", async () => {
    answering(submissions, 'findOne', loadedSubmission());

    await expect(provider.getUserPresentation(GUID, 'auth0|entrant')).resolves.toMatchObject({ guid: GUID });
  });

  it('adds a submission to the season the body names', async () => {
    await expect(
      provider.insertUserSubmission('auth0|entrant', {
        title: 'A poster',
        submissionType: 'poster',
        season: { guid: 's-1' } as Season
      })
    ).resolves.toMatchObject({ accountGuid: 'auth0|entrant' });
  });

  it("records a reviewer's decision on one submission and reads who to email", async () => {
    answering(submissions, 'findOne', loadedSubmission());

    await expect(
      provider.updateUserSubmission(GUID, 'auth0|reviewer', { acceptance: true, message: 'Well done' }, REVIEWER)
    ).resolves.toBeDefined();
  });

  it("records a reviewer's decision on several submissions", async () => {
    answering(submissions, 'findOne', loadedSubmission());

    await expect(provider.reviewUserSubmissions([GUID], 'auth0|reviewer', { acceptance: true }, REVIEWER)).resolves.toEqual({
      reviewed: ['A poster'],
      failed: []
    });
  });

  it('previews the review email of several submissions', async () => {
    answering(submissions, 'findOne', loadedSubmission());

    await expect(provider.previewReview([GUID], { acceptance: true }, REVIEWER)).resolves.toMatchObject({
      groups: [{ count: 1 }]
    });
  });

  it('previews the final reminder of several submissions', async () => {
    answering(submissions, 'findOne', loadedSubmission({ reviewed: true, acceptance: true }));

    await expect(provider.previewReminders([GUID], REVIEWER)).resolves.toMatchObject({
      groups: [{ count: 1 }],
      skipped: []
    });
  });

  it('sends the final reminder to several submissions', async () => {
    answering(submissions, 'findOne', loadedSubmission({ reviewed: true, acceptance: true }));

    await expect(provider.remindUserSubmissions([GUID], {}, REVIEWER)).resolves.toEqual({
      sent: ['A poster'],
      skipped: [],
      failed: []
    });
  });

  it('deletes a submission with its files', async () => {
    answering(
      submissions,
      'findOne',
      loadedSubmission({ files: [Object.assign(new Asset(), { guid: 'a-1', path: null })] })
    );

    await expect(provider.deleteUserSubmission(GUID, 'auth0|entrant')).resolves.toBeDefined();
  });
});
