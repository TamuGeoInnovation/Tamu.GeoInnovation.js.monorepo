import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { Season, SeasonDay } from '../entities/all.entity';
import { SeasonService } from './season.service';

/**
 * These exercise the lookup and ordering paths. `clonePreviousSeason` is deliberately not covered
 * here: it runs a ~200 line transaction across eleven entity types, and mocking `manager` well
 * enough to say anything true about it would assert the shape of the mock rather than the shape of
 * the clone. It needs an integration test against a real database.
 */
describe('SeasonService', () => {
  let service: SeasonService;
  let seasonRepo: Repository<Season>;
  let seasonDayRepo: Repository<SeasonDay>;

  /** Dates land out of order on purpose so an absent sort is visible rather than coincidental. */
  const day = (guid: string, iso: string) => ({ guid, date: new Date(iso) }) as SeasonDay;

  const seasonWithDays = (days: Array<SeasonDay>) =>
    ({ guid: 'season-1', year: 2026, active: true, days }) as Season;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonService,
        {
          provide: getRepositoryToken(Season),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            manager: { transaction: jest.fn(), find: jest.fn() }
          }
        },
        {
          provide: getRepositoryToken(SeasonDay),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() }
        }
      ]
    }).compile();

    service = module.get<SeasonService>(SeasonService);
    seasonRepo = module.get(getRepositoryToken(Season));
    seasonDayRepo = module.get(getRepositoryToken(SeasonDay));
  });

  // The `.create()` block spies on statics of the Season entity itself, which is module state
  // rather than per-test state. Without this they leak into every later test in the file.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.findAllOrdered()', () => {
    it('returns seasons ordered by year with their days sorted by date', async () => {
      const unordered = [day('d-late', '2026-11-20'), day('d-early', '2026-11-18')];
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([seasonWithDays(unordered)]);

      const [season] = await service.findAllOrdered();

      expect(season.days.map((d) => d.guid)).toEqual(['d-early', 'd-late']);
      expect(seasonRepo.find).toHaveBeenCalledWith({
        order: { year: 'ASC' },
        relations: ['days']
      });
    });

    it('tolerates a season with no days', async () => {
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([seasonWithDays([])]);

      await expect(service.findAllOrdered()).resolves.toEqual([
        expect.objectContaining({ days: [] })
      ]);
    });
  });

  describe('.findOneWithOrderedDays()', () => {
    it('sorts the days of the requested season', async () => {
      jest
        .spyOn(seasonRepo, 'findOne')
        .mockResolvedValue(seasonWithDays([day('d-late', '2026-11-20'), day('d-early', '2026-11-18')]));

      const season = await service.findOneWithOrderedDays('season-1');

      expect(season.days.map((d) => d.guid)).toEqual(['d-early', 'd-late']);
      expect(seasonRepo.findOne).toHaveBeenCalledWith({
        where: { guid: 'season-1' },
        relations: ['days']
      });
    });

    it('throws NotFound when no season has that guid', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOneWithOrderedDays('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('.findOneActive()', () => {
    it('reports the start time of the earliest active event on the first day', async () => {
      const first = day('d-first', '2026-11-18');
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([day('d-second', '2026-11-19'), first]));
      jest.spyOn(seasonDayRepo, 'findOne').mockResolvedValue({
        ...first,
        events: [
          { guid: 'e-late', active: true, startTime: '14:00' },
          { guid: 'e-early', active: true, startTime: '09:00' }
        ]
      } as unknown as SeasonDay);

      const season = await service.findOneActive();

      expect(season.firstEventTime).toBe('09:00');
      // The extended lookup must target the *earliest* day, which is second in the unsorted input.
      expect(seasonDayRepo.findOne).toHaveBeenCalledWith({
        where: { guid: 'd-first' },
        relations: ['events']
      });
    });

    it('ignores inactive events when choosing the first start time', async () => {
      const first = day('d-first', '2026-11-18');
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([first]));
      jest.spyOn(seasonDayRepo, 'findOne').mockResolvedValue({
        ...first,
        events: [
          { guid: 'e-hidden', active: false, startTime: '07:00' },
          { guid: 'e-shown', active: true, startTime: '11:00' }
        ]
      } as unknown as SeasonDay);

      await expect(service.findOneActive()).resolves.toEqual(
        expect.objectContaining({ firstEventTime: '11:00' })
      );
    });

    it('leaves firstEventTime null when the first day has no active events', async () => {
      const first = day('d-first', '2026-11-18');
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([first]));
      jest.spyOn(seasonDayRepo, 'findOne').mockResolvedValue({
        ...first,
        events: [{ guid: 'e-hidden', active: false, startTime: '07:00' }]
      } as unknown as SeasonDay);

      await expect(service.findOneActive()).resolves.toEqual(
        expect.objectContaining({ firstEventTime: null })
      );
    });

    it('leaves firstEventTime null when the season has no days', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([]));

      await expect(service.findOneActive()).resolves.toEqual(
        expect.objectContaining({ firstEventTime: null })
      );
      expect(seasonDayRepo.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFound when no season is marked active', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOneActive()).rejects.toThrow(NotFoundException);
    });
  });

  describe('.create()', () => {
    /**
     * Regression coverage. The existence check read `existing === undefined`, but TypeORM 0.3
     * resolves `findOne` to **null** when nothing matches -- 0.2 was the version that returned
     * undefined. The comparison was therefore never true, every call took the `else`, and creating
     * a season for a year that did not exist yet answered 409 Conflict.
     */
    it('creates a season for a year that does not exist yet', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(seasonRepo, 'create').mockReturnValue({ year: 2027 } as Season);
      jest.spyOn(seasonRepo, 'save').mockResolvedValue({ guid: 'new', year: 2027 } as Season);

      await expect(service.create({ year: 2027 })).resolves.toEqual(
        expect.objectContaining({ year: 2027 })
      );
      expect(seasonRepo.save).toHaveBeenCalled();
    });

    it('throws Conflict when a season already exists for that year', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue({ guid: 'existing', year: 2027 } as Season);
      const save = jest.spyOn(seasonRepo, 'save');

      await expect(service.create({ year: 2027 })).rejects.toThrow(ConflictException);
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects a non-numeric year before reaching the database', async () => {
      const findOne = jest.spyOn(seasonRepo, 'findOne');

      await expect(service.create({ year: '2027' } as unknown as Partial<Season>)).rejects.toThrow(
        BadRequestException
      );
      expect(findOne).not.toHaveBeenCalled();
    });

    /**
     * `Season.incrementYear` and `Season.createForCurrentYear` are TypeORM ActiveRecord statics --
     * they build entities that carry their own persistence and need a live DataSource, which the
     * injected repository mock does not provide. These assert that `create()` picks the right
     * static and saves what it returns. What the statics themselves produce is TypeORM's behaviour
     * and belongs in an integration test.
     */
    it('derives the next season from the latest one when none is supplied', async () => {
      const previous = { guid: 'prev', year: 2026, active: true } as Season;
      const next = { year: 2027 } as Season;
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([previous]);
      const increment = jest.spyOn(Season, 'incrementYear').mockReturnValue(next);
      const forCurrentYear = jest.spyOn(Season, 'createForCurrentYear');
      jest.spyOn(seasonRepo, 'save').mockImplementation((s) => Promise.resolve(s as Season));

      await expect(service.create()).resolves.toEqual(expect.objectContaining({ year: 2027 }));
      expect(increment).toHaveBeenCalledWith(previous);
      expect(forCurrentYear).not.toHaveBeenCalled();
      expect(seasonRepo.save).toHaveBeenCalledWith(next);
    });

    it('falls back to the current year when there is no previous season', async () => {
      const fresh = { year: new Date().getFullYear() } as Season;
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([]);
      const increment = jest.spyOn(Season, 'incrementYear');
      jest.spyOn(Season, 'createForCurrentYear').mockReturnValue(fresh);
      jest.spyOn(seasonRepo, 'save').mockImplementation((s) => Promise.resolve(s as Season));

      await expect(service.create()).resolves.toEqual(
        expect.objectContaining({ year: new Date().getFullYear() })
      );
      expect(increment).not.toHaveBeenCalled();
    });
  });

  describe('.getPreviousSeason()', () => {
    it('asks for the single most recent season by year', async () => {
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([{ guid: 'prev', year: 2026 } as Season]);

      await expect(service.getPreviousSeason()).resolves.toEqual(
        expect.objectContaining({ guid: 'prev' })
      );
      expect(seasonRepo.find).toHaveBeenCalledWith({ order: { year: 'DESC' }, take: 1 });
    });

    it('resolves undefined rather than throwing when there are no seasons', async () => {
      // The catch only fires on a database error. An empty result is not one, so the
      // "No previous season found." message this method advertises is unreachable that way --
      // callers have to handle undefined, and `create()` does.
      jest.spyOn(seasonRepo, 'find').mockResolvedValue([]);

      await expect(service.getPreviousSeason()).resolves.toBeUndefined();
    });

    it('reads through a supplied EntityManager when one is given', async () => {
      const manager = { find: jest.fn().mockResolvedValue([{ guid: 'from-manager' } as Season]) };

      await expect(
        service.getPreviousSeason(manager as never)
      ).resolves.toEqual(expect.objectContaining({ guid: 'from-manager' }));
      expect(seasonRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('.deleteEntity()', () => {
    it('throws NotFound when the season does not exist', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.deleteEntity('missing')).rejects.toThrow(NotFoundException);
    });

    it('accepts a bare guid and a lookup options object alike', async () => {
      const findOne = jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.deleteEntity('by-string')).rejects.toThrow(NotFoundException);
      expect(findOne).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { guid: 'by-string' } })
      );

      await expect(service.deleteEntity({ where: { guid: 'by-options' } })).rejects.toThrow(
        NotFoundException
      );
      expect(findOne).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { guid: 'by-options' } })
      );
    });
  });
});
