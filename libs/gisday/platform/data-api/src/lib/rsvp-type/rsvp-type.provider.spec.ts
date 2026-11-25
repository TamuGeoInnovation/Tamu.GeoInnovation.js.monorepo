import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { RsvpType } from '../entities/all.entity';
import { RsvpTypeProvider } from './rsvp-type.provider';

/**
 * This provider adds nothing to `BaseProvider`, so its behaviour is covered by
 * base-provider.spec.ts. What is specific to it -- and the only thing that can be wrong here -- is
 * that the RsvpType repository is the one wired in; injecting another entity's repository would
 * compile and silently read the wrong table.
 */
describe('RsvpTypeProvider', () => {
  let provider: RsvpTypeProvider;
  let repo: Repository<RsvpType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpTypeProvider,
        {
          provide: getRepositoryToken(RsvpType),
          useValue: { find: vi.fn(), findOne: vi.fn(), create: vi.fn(), save: vi.fn(), delete: vi.fn() }
        }
      ]
    }).compile();

    provider = module.get<RsvpTypeProvider>(RsvpTypeProvider);
    repo = module.get(getRepositoryToken(RsvpType));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('routes inherited lookups to the RsvpType repository', async () => {
    vi.spyOn(repo, 'find').mockResolvedValue([{ guid: 'x-1' }] as never);

    await expect(provider.find({})).resolves.toEqual([{ guid: 'x-1' }]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('routes inherited deletes to the RsvpType repository', async () => {
    vi.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as never);

    await provider.deleteEntities(['x-1']);

    expect(repo.delete).toHaveBeenCalledWith(['x-1']);
  });
});
