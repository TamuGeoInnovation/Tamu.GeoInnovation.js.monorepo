import { UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { Speaker, University } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { UniversityProvider } from './university.provider';

describe('UniversityProvider', () => {
  let provider: UniversityProvider;
  let universityRepo: Repository<University>;
  let seasonService: SeasonService;

  const withManager = (manager: Record<string, jest.Mock>) => {
    (universityRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversityProvider,
        {
          provide: getRepositoryToken(University),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    provider = module.get<UniversityProvider>(UniversityProvider);
    universityRepo = module.get(getRepositoryToken(University));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getEntitiesForSeason()', () => {
    it('scopes to the season, loads it, and orders by name', async () => {
      jest.spyOn(universityRepo, 'find').mockResolvedValue([{ guid: 'u-1' } as University]);

      await expect(provider.getEntitiesForSeason('season-1')).resolves.toEqual([{ guid: 'u-1' }]);
      expect(universityRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        relations: ['season'],
        order: { name: 'ASC' }
      });
    });
  });

  describe('.getEntitiesForActiveSeason()', () => {
    it('rejects when there is no active season', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(null);

      await expect(provider.getEntitiesForActiveSeason()).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });

  describe('.insertUniversitiesIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.insertUniversitiesIntoSeason('missing', ['u-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when none of the requested universities exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(universityRepo, 'find').mockResolvedValue([]);

      await expect(provider.insertUniversitiesIntoSeason('season-2', ['u-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity from the copy and attaches the target season', async () => {
      const season = { guid: 'season-2' };
      const source = {
        guid: 'u-1',
        created: new Date(),
        updated: new Date(),
        name: 'Texas A&M'
      } as unknown as University;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(universityRepo, 'find').mockResolvedValue([source]);
      jest.spyOn(universityRepo, 'create').mockImplementation((u) => ({ ...(u as object) }) as never);
      jest.spyOn(universityRepo, 'save').mockImplementation((u) => Promise.resolve(u as never));

      await provider.insertUniversitiesIntoSeason('season-2', ['u-1']);

      const passed = (universityRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toBe(season);
      expect(passed.name).toBe('Texas A&M');
    });

    /**
     * Regression coverage.
     *
     * The save was returned from inside the `try` without being awaited, so its rejection settled
     * outside the block and the catch never ran. A failed write surfaced as a raw driver error
     * rather than the 422 the catch was written to produce.
     */
    it('translates a failed write into a 422 instead of letting the driver error escape', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(universityRepo, 'find').mockResolvedValue([{ guid: 'u-1' } as University]);
      jest.spyOn(universityRepo, 'create').mockImplementation((u) => ({ ...(u as object) }) as never);
      jest.spyOn(universityRepo, 'save').mockRejectedValue(new Error('duplicate key'));

      await expect(provider.insertUniversitiesIntoSeason('season-2', ['u-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });

  describe('.deleteEntities()', () => {
    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await provider.deleteEntities('u-1,u-2');
      expect(manager.delete).toHaveBeenLastCalledWith(University, ['u-1', 'u-2']);

      await provider.deleteEntities(['u-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(University, ['u-3']);
    });

    /**
     * A speaker's university is a foreign key, so the rows have to be detached before the
     * universities go, and both have to happen in the same transaction or a failed delete leaves
     * speakers pointing at nothing.
     */
    it('detaches the university from its speakers before deleting it', async () => {
      const speaker = { guid: 's-1', university: { guid: 'u-1' } } as Speaker;
      const manager = {
        find: jest.fn().mockResolvedValue([speaker]),
        save: jest.fn().mockResolvedValue([speaker]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['u-1']);

      expect(speaker.university).toBeNull();
      expect(manager.save).toHaveBeenCalledWith([speaker]);
      expect(manager.save.mock.invocationCallOrder[0]).toBeLessThan(
        manager.delete.mock.invocationCallOrder[0]
      );
    });

    /** Regression coverage -- same unawaited-return problem as the insert path above. */
    it('translates a failed transaction into a 422 instead of letting the driver error escape', async () => {
      (universityRepo.manager.transaction as jest.Mock).mockRejectedValue(new Error('deadlock'));

      await expect(provider.deleteEntities(['u-1'])).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
