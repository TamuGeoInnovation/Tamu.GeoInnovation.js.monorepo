import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { queryCheckingDataSource, queryCheckingRepository, Season } from '@tamu-gisc/gisday/platform/data-api';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  GISDAY_COMPETITIONS_ENTITIES,
  SubmissionMedia
} from '../entities/all.entities';
import { SubmissionService } from './submission.service';

/**
 * The submissions' queries as typeorm builds them, with the real entities (#2363). submission.service.spec.ts mocks the
 * repositories, so it cannot see a where clause typeorm refuses, such as one holding a loaded row with a `null` column.
 * The loaded rows here have their nullable columns `null`, as they come from the database.
 */
describe('SubmissionService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let submissionRepo: Repository<CompetitionSubmission>;
  let compSeasonRepo: Repository<CompetitionSeason>;
  let seasonRepo: Repository<Season>;
  let service: SubmissionService;

  const season = () =>
    Object.assign(new Season(), {
      guid: 's-2026',
      year: 2026,
      active: true,
      posterSubmissionsCloseAt: null,
      paperFilesCloseAt: null
    });

  const compSeason = () =>
    Object.assign(new CompetitionSeason(), {
      guid: 'cs-2026',
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: null,
      form: Object.assign(new CompetitionForm(), {
        guid: 'f-2026',
        source: '',
        model: [{ attribute: 'memorial_type', isDiscriminator: true, options: [{ name: 'Bench', value: 'bench' }] }]
      })
    });

  const submission = () =>
    Object.assign(new CompetitionSubmission(), {
      guid: 'sub-1',
      userGuid: 'u-1',
      value: { memorial_type: 'bench' },
      validationStatus: null,
      blobs: [],
      // A write: answered here, so the method runs to the end.
      save: async function () {
        return this;
      }
    });

  /** Makes `repo.findOne` answer with `row` once it has built its SQL. */
  function answers<T extends ObjectLiteral>(repo: Repository<T>, row: T) {
    const build = repo.findOne.bind(repo);

    repo.findOne = async (options) => (await build(options), row);
  }

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  beforeEach(() => {
    submissionRepo = queryCheckingRepository(dataSource, CompetitionSubmission);
    compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);
    seasonRepo = queryCheckingRepository(dataSource, Season);

    service = new SubmissionService(
      submissionRepo,
      queryCheckingRepository(dataSource, CompetitionSubmissionValidationStatus),
      queryCheckingRepository(dataSource, SubmissionMedia),
      compSeasonRepo,
      seasonRepo,
      null as never,
      { publishInBackground: () => undefined, publishSeasonInBackground: async () => undefined } as never
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it('reads a submission by its guid', async () => {
    await expect(service.getSubmissionByGuid('sub-1')).resolves.toBeNull();
  });

  it("reviews a new submission against the participant's earlier ones in its season", async () => {
    // The review's failures are caught and logged, so its find is watched for one typeorm refuses.
    const refused: Array<unknown> = [];
    const build = submissionRepo.find.bind(submissionRepo);

    submissionRepo.find = async (options) => {
      try {
        return await build(options);
      } catch (err) {
        refused.push(err);
        throw err;
      }
    };

    // The transaction only writes: answered here with the submission it would insert.
    vi.spyOn(submissionRepo.manager, 'transaction').mockResolvedValue({ guid: 'sub-1' } as never);

    await expect(
      service.createCompetitionSubmission({
        guid: 'sub-1',
        userGuid: 'u-1',
        value: { memorial_type: 'bench' } as never,
        location: { latitude: 30.61, longitude: -96.34, accuracy: null } as never,
        season: compSeason()
      })
    ).resolves.toEqual({ guid: 'sub-1' });

    expect(refused).toEqual([]);
  });

  it("publishes the active season's competition season, found from the loaded active season", async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.publishActiveSeasonToArcgis()).resolves.toBeUndefined();
  });

  it('validates a submission with no validation status yet', async () => {
    answers(submissionRepo, submission());

    await expect(
      service.validateSubmission({ guid: 'sub-1', status: 'verified', userGuid: 'admin-1' } as never)
    ).resolves.toMatchObject({ guid: 'sub-1' });
  });

  it("lists a participant's submissions in the active season", async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.getUserSubmissions({ userGuid: 'u-1' } as never)).resolves.toEqual([]);
  });

  it("lists a participant's submissions in a season named by its guid", async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.getUserSubmissions({ userGuid: 'u-1', seasonGuid: 's-2026' } as never)).resolves.toEqual([]);
  });

  it('lists every submission of the active season for an admin, newest first', async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.getAdminSubmissions({} as never)).resolves.toEqual([]);
  });

  it('lists every submission of a season named by its guid for an admin', async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.getAdminSubmissions({ seasonGuid: 's-2026' } as never)).resolves.toEqual([]);
  });

  it("reads a submission's images", async () => {
    answers(submissionRepo, submission());

    await expect(service.getSubmissionImages('sub-1')).resolves.toEqual([]);
  });
});
