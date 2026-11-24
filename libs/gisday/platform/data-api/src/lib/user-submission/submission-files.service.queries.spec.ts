import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Asset, Season, Submission } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SubmissionFilesService } from './submission-files.service';

// The service's queries as typeorm builds them, with the real entities (#2363). submission-files.service.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
// `add` and `download` look the submission up as `list` does; the rest of them is the disk.
describe('SubmissionFilesService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: SubmissionFilesService;
  let submissionRepo: Repository<Submission>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  const student = { sub: 'auth0|student', permissions: [] };
  const admin = { sub: 'auth0|admin', permissions: ['read:competitions', 'update:competitions'] };

  // A submission as the API loads it with its files and season: their nullable columns come back null.
  const loadedSubmission = () =>
    Object.assign(new Submission(), {
      guid: 'sub-1',
      accountGuid: student.sub,
      title: 'A poster',
      abstract: null,
      submissionType: 'poster',
      season: Object.assign(new Season(), { guid: 's-1', year: 2026, startDate: null, endDate: null }),
      files: [
        Object.assign(new Asset(), {
          guid: 'f-1',
          name: 'poster.pdf',
          path: 'submissions/sub-1/f-1.pdf',
          type: 'submission-file',
          created: new Date('2026-11-01T15:00:00Z')
        })
      ]
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
  });

  beforeEach(() => {
    statements.length = 0;
    submissionRepo = queryCheckingRepository(dataSource, Submission);
    service = new SubmissionFilesService(submissionRepo, queryCheckingRepository(dataSource, Asset), {
      deleteAssetFiles: async () => undefined
    } as unknown as AssetsService);
  });

  it("lists a student's own submission's files", async () => {
    const build = submissionRepo.findOne;
    submissionRepo.findOne = async (options) => (await build(options), loadedSubmission());

    const files = await service.list('sub-1', student);

    expect(files.map((f) => f.guid)).toEqual(['f-1']);
  });

  it("removes a file from a student's own submission, by its key", async () => {
    const build = submissionRepo.findOne;
    submissionRepo.findOne = async (options) => (await build(options), loadedSubmission());

    await service.remove('sub-1', 'f-1', student);

    const deletes = statements.filter((s) => /^\s*DELETE FROM "assets"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['f-1']]);
  });

  it("looks for a season's submissions and their files to zip", async () => {
    await expect(service.zipForSeason('s-1', admin)).rejects.toThrow(NotFoundException);
  });
});
