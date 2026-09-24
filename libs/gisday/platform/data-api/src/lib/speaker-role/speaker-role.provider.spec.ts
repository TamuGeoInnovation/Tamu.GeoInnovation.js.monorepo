import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { SpeakerRole } from '../entities/all.entity';
import { SpeakerRoleProvider } from './speaker-role.provider';

describe('SpeakerRoleProvider', () => {
  let provider: SpeakerRoleProvider;
  let speakerRoleRepo: Repository<SpeakerRole>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakerRoleProvider,
        {
          provide: getRepositoryToken(SpeakerRole),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), insert: jest.fn(), delete: jest.fn() }
        }
      ]
    }).compile();

    provider = module.get<SpeakerRoleProvider>(SpeakerRoleProvider);
    speakerRoleRepo = module.get(getRepositoryToken(SpeakerRole));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.insertRoles()', () => {
    /**
     * `create` is what applies entity defaults and column transforms, so inserting the raw argument
     * instead of the created entity would write rows that bypass them.
     */
    it('inserts the created entities rather than the raw input', async () => {
      const raw = [{ name: 'Presenter' }, { name: 'Moderator' }];
      const created = [{ name: 'Presenter' }, { name: 'Moderator' }];
      jest.spyOn(speakerRoleRepo, 'create').mockReturnValue(created as never);
      jest.spyOn(speakerRoleRepo, 'insert').mockResolvedValue({} as never);

      await provider.insertRoles(raw);

      expect(speakerRoleRepo.create).toHaveBeenCalledWith(raw);
      expect(speakerRoleRepo.insert).toHaveBeenCalledWith(created);
    });
  });

  // Everything else this provider exposes comes from BaseProvider; what is specific to it is that
  // the SpeakerRole repository is the one wired in. See base-provider.spec.ts for the behaviour.
  describe('BaseProvider wiring', () => {
    it('routes inherited lookups to the SpeakerRole repository', async () => {
      jest.spyOn(speakerRoleRepo, 'findOne').mockResolvedValue({ guid: 'sr-1' } as never);

      await expect(provider.findOne('sr-1')).resolves.toEqual({ guid: 'sr-1' });
      expect(speakerRoleRepo.findOne).toHaveBeenCalledWith({ where: { guid: 'sr-1' } });
    });
  });
});
