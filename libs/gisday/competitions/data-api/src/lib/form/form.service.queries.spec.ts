import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { queryCheckingDataSource, queryCheckingRepository, Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason, GISDAY_COMPETITIONS_ENTITIES } from '../entities/all.entities';
import { FormService } from './form.service';

/**
 * The competition forms' queries as typeorm builds them, with the real entities (#2363). form.service.spec.ts mocks the
 * repositories, so it cannot see a where clause typeorm refuses, such as one holding a loaded row with a `null` column.
 * The loaded rows here have their nullable columns `null`, as they come from the database.
 */
describe('FormService queries, built by typeorm', () => {
  const model = [{ attribute: 'memorial_type', isDiscriminator: true, options: [] }] as never;

  let dataSource: DataSource;
  let compSeasonRepo: Repository<CompetitionSeason>;
  let seasonRepo: Repository<Season>;
  let service: FormService;

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
      allowSubmissions: false,
      scoringOpensAt: null,
      scoringClosesAt: null,
      form: Object.assign(new CompetitionForm(), { guid: 'f-2026', source: '', model })
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
    compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);
    seasonRepo = queryCheckingRepository(dataSource, Season);

    service = new FormService(queryCheckingRepository(dataSource, CompetitionForm), compSeasonRepo, seasonRepo);

    // A competition season's save() is a write, through the entity: answered here with the row it would save.
    vi.spyOn(CompetitionSeason.prototype, 'save').mockImplementation(async function () {
      return this;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("reads a season's competition season and form by the season's guid", async () => {
    await expect(service.getSeason('s-2026')).resolves.toBeNull();
  });

  it("reads the active season's competition season, found from the loaded active season", async () => {
    answers(seasonRepo, season());
    answers(compSeasonRepo, compSeason());

    await expect(service.getActiveSeason()).resolves.toMatchObject({ guid: 'cs-2026' });
  });

  it('creates a form for the active season once it finds the season has none', async () => {
    answers(seasonRepo, season());

    await expect(
      service.createFormForActiveSeason({ source: '', model }, { scoringOpensAt: null, scoringClosesAt: null })
    ).resolves.toMatchObject({ allowSubmissions: false });
  });

  it("updates a form, found by the form's guid", async () => {
    answers(compSeasonRepo, compSeason());

    await expect(service.updateForm('f-2026', { source: '', model })).resolves.toMatchObject({ guid: 'cs-2026' });
  });
});
