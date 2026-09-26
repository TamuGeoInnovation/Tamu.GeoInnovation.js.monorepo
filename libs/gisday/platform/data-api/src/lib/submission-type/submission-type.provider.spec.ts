import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { SubmissionType } from '../entities/all.entity';
import { SubmissionTypeProvider } from './submission-type.provider';

/**
 * This provider adds nothing to `BaseProvider`, so its behaviour is covered by
 * base-provider.spec.ts. What is specific to it -- and the only thing that can be wrong here -- is
 * that the SubmissionType repository is the one wired in; injecting another entity's repository would
 * compile and silently read the wrong table.
 */
describe('SubmissionTypeProvider', () => {
  let provider: SubmissionTypeProvider;
  let repo: Repository<SubmissionType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionTypeProvider,
        {
          provide: getRepositoryToken(SubmissionType),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() }
        }
      ]
    }).compile();

    provider = module.get<SubmissionTypeProvider>(SubmissionTypeProvider);
    repo = module.get(getRepositoryToken(SubmissionType));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('routes inherited lookups to the SubmissionType repository', async () => {
    jest.spyOn(repo, 'find').mockResolvedValue([{ guid: 'x-1' }] as never);

    await expect(provider.find({})).resolves.toEqual([{ guid: 'x-1' }]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('routes inherited deletes to the SubmissionType repository', async () => {
    jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as never);

    await provider.deleteEntities(['x-1']);

    expect(repo.delete).toHaveBeenCalledWith(['x-1']);
  });
});
