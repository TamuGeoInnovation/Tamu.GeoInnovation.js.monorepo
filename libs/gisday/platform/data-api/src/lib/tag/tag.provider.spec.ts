import { UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { Season, Tag } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { TagProvider } from './tag.provider';

describe('TagProvider', () => {
  let provider: TagProvider;
  let tagRepo: Repository<Tag>;
  let seasonService: SeasonService;

  const queryBuilder = (result: unknown) => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['where', 'andWhere', 'leftJoin']) {
      qb[m] = jest.fn(() => qb);
    }
    qb.getOne = jest.fn().mockResolvedValue(result);
    return qb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagProvider,
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            insert: jest.fn(),
            createQueryBuilder: jest.fn()
          }
        },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    provider = module.get<TagProvider>(TagProvider);
    tagRepo = module.get(getRepositoryToken(Tag));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getTagsForSeason()', () => {
    it('scopes to the season and orders by name', async () => {
      jest.spyOn(tagRepo, 'find').mockResolvedValue([{ guid: 't-1' } as Tag]);

      await expect(provider.getTagsForSeason('season-1')).resolves.toEqual([{ guid: 't-1' }]);
      expect(tagRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        order: { name: 'ASC' }
      });
    });
  });

  describe('.getTagsForActiveSeason()', () => {
    it('rejects when there is no active season', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(null);

      await expect(provider.getTagsForActiveSeason()).rejects.toThrow(UnprocessableEntityException);
    });

    it('scopes the lookup to the active season', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'season-active' } as never);
      jest.spyOn(tagRepo, 'find').mockResolvedValue([]);

      await provider.getTagsForActiveSeason();

      expect(tagRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { season: { guid: 'season-active' } } })
      );
    });
  });

  describe('.getTags()', () => {
    it('returns every tag ordered by name', async () => {
      jest.spyOn(tagRepo, 'find').mockResolvedValue([]);

      await provider.getTags();

      expect(tagRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('.copyTagsIntoSeason()', () => {
    /**
     * Regression coverage.
     *
     * The guard read `season === undefined`. TypeORM 0.3 resolves `null` for no match, so it never
     * fired: the copy went ahead and wrote tags carrying a null season. Those rows belong to no
     * season and cannot be reached by any season-scoped query, so they are invisible to the app but
     * still in the table.
     */
    it('refuses to copy into a season that does not exist, rather than writing orphaned tags', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);
      const save = jest.spyOn(tagRepo, 'save');

      await expect(provider.copyTagsIntoSeason('missing', ['t-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects when none of the requested tags exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(tagRepo, 'find').mockResolvedValue([]);

      await expect(provider.copyTagsIntoSeason('season-2', ['t-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity from the copy and attaches the target season', async () => {
      const season = { guid: 'season-2' };
      const source = {
        guid: 't-1',
        created: new Date(),
        updated: new Date(),
        name: 'Remote Sensing'
      } as unknown as Tag;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(tagRepo, 'find').mockResolvedValue([source]);
      jest.spyOn(tagRepo, 'create').mockImplementation((t) => ({ ...(t as object) }) as never);
      jest.spyOn(tagRepo, 'save').mockImplementation((t) => Promise.resolve(t as never));

      await provider.copyTagsIntoSeason('season-2', ['t-1']);

      const passed = (tagRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toBe(season);
      expect(passed.name).toBe('Remote Sensing');
    });
  });

  describe('.insertTags()', () => {
    it('creates the entities before inserting them', async () => {
      const created = [{ name: 'LiDAR' }];
      jest.spyOn(tagRepo, 'create').mockReturnValue(created as never);
      jest.spyOn(tagRepo, 'insert').mockResolvedValue({} as never);

      await provider.insertTags([{ name: 'LiDAR' }]);

      expect(tagRepo.insert).toHaveBeenCalledWith(created);
    });
  });

  describe('.createTag()', () => {
    /**
     * Regression coverage.
     *
     * `getOne()` resolves `null` for no match under TypeORM 0.3, but the guard read
     * `existing === undefined`. It therefore never took the create branch: every call fell to
     * `return existing` and handed back that null. The endpoint behind this has never created a
     * tag -- it answered 200 with a null body and wrote nothing.
     */
    it('creates the tag when none matches, instead of returning null', async () => {
      jest.spyOn(tagRepo, 'createQueryBuilder').mockReturnValue(queryBuilder(null) as never);
      jest.spyOn(tagRepo, 'create').mockReturnValue({ name: 'LiDAR' } as never);
      jest.spyOn(tagRepo, 'save').mockResolvedValue({ guid: 't-new', name: 'LiDAR' } as never);

      await expect(provider.createTag({ name: 'LiDAR' })).resolves.toEqual({
        guid: 't-new',
        name: 'LiDAR'
      });
      expect(tagRepo.save).toHaveBeenCalled();
    });

    it('returns the existing tag rather than creating a duplicate', async () => {
      const existing = { guid: 't-1', name: 'LiDAR' } as Tag;
      jest.spyOn(tagRepo, 'createQueryBuilder').mockReturnValue(queryBuilder(existing) as never);
      const create = jest.spyOn(tagRepo, 'create');

      await expect(provider.createTag({ name: 'LiDAR' })).resolves.toBe(existing);
      expect(create).not.toHaveBeenCalled();
    });

    it('narrows the match to the season when one is supplied', async () => {
      const qb = queryBuilder(null);
      jest.spyOn(tagRepo, 'createQueryBuilder').mockReturnValue(qb as never);
      jest.spyOn(tagRepo, 'create').mockReturnValue({} as never);
      jest.spyOn(tagRepo, 'save').mockResolvedValue({} as never);

      await provider.createTag({ name: 'LiDAR', season: { guid: 'season-1' } as Season });

      expect(qb.leftJoin).toHaveBeenCalledWith('tag.season', 'season');
      expect(qb.andWhere).toHaveBeenCalledWith('season.guid = :guid', { guid: 'season-1' });
    });

    // A tag with no season is global, so the lookup must not join one in -- doing so would match
    // nothing and create a duplicate on every call.
    it('does not join the season when the tag has none', async () => {
      const qb = queryBuilder(null);
      jest.spyOn(tagRepo, 'createQueryBuilder').mockReturnValue(qb as never);
      jest.spyOn(tagRepo, 'create').mockReturnValue({} as never);
      jest.spyOn(tagRepo, 'save').mockResolvedValue({} as never);

      await provider.createTag({ name: 'LiDAR' });

      expect(qb.leftJoin).not.toHaveBeenCalled();
    });
  });
});
