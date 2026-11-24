import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository, getMetadataArgsStorage } from 'typeorm';

import { SUBMISSION_DEADLINE_FIELDS } from '@tamu-gisc/gisday/common';

import { Season, SeasonCompetition, SeasonDay } from '../entities/all.entity';
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
            update: jest.fn().mockResolvedValue({ affected: 1 }),
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
        relations: { days: true }
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
        relations: { days: true }
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
        relations: { events: true }
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

  describe('.findOneByYear()', () => {
    it('looks the season up by year and returns it in the active season shape', async () => {
      const first = day('d-first', '2025-11-17');
      jest
        .spyOn(seasonRepo, 'findOne')
        .mockResolvedValue({ ...seasonWithDays([day('d-second', '2025-11-18'), first]), year: 2025, active: false } as Season);
      jest.spyOn(seasonDayRepo, 'findOne').mockResolvedValue({
        ...first,
        events: [{ guid: 'e-workshop', active: true, startTime: '09:00' }]
      } as unknown as SeasonDay);

      const season = await service.findOneByYear(2025);

      expect(seasonRepo.findOne).toHaveBeenCalledWith({
        where: { year: 2025 },
        relations: { days: { events: true } }
      });
      expect(season.days.map((d) => d.guid)).toEqual(['d-first', 'd-second']);
      expect(season.firstEventTime).toBe('09:00');
    });

    it('throws NotFound when there is no season for that year', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOneByYear(1999)).rejects.toThrow(NotFoundException);
    });

    it('rejects a year that is not a whole number before reaching the database', async () => {
      const findOne = jest.spyOn(seasonRepo, 'findOne');

      await expect(service.findOneByYear(2025.5)).rejects.toThrow(BadRequestException);
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('.findOneWithDaysAndEvents()', () => {
    it('loads the season with its days and their events', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([]));

      await service.findOneWithDaysAndEvents('season-1');

      expect(seasonRepo.findOne).toHaveBeenCalledWith({
        where: { guid: 'season-1' },
        relations: { days: { events: true } }
      });
    });

    it('throws NotFound when no season has that guid', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOneWithDaysAndEvents('nope')).rejects.toThrow(NotFoundException);
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

  /** #2934, #2962: when each competition closes, set by an admin. */
  describe('.setSubmissionDeadlines()', () => {
    const closes = '2026-11-01T17:00:00.000Z';
    const filesClose = '2026-11-05T17:00:00.000Z';

    beforeEach(() => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(seasonWithDays([]));
    });

    it('saves every moment, each a date or empty for open', async () => {
      await service.setSubmissionDeadlines('season-1', {
        posterSubmissionsCloseAt: closes,
        posterFilesCloseAt: filesClose,
        presentationSubmissionsCloseAt: ''
      });

      expect(seasonRepo.update).toHaveBeenCalledWith('season-1', {
        posterSubmissionsCloseAt: new Date(closes),
        posterFilesCloseAt: new Date(filesClose),
        presentationSubmissionsCloseAt: null,
        presentationFilesCloseAt: null,
        paperSubmissionsCloseAt: null,
        paperFilesCloseAt: null,
        cartographySubmissionsCloseAt: null,
        cartographyFilesCloseAt: null
      });
    });

    it('refuses a moment that is not a date', async () => {
      await expect(service.setSubmissionDeadlines('season-1', { posterSubmissionsCloseAt: 'next Friday' })).rejects.toThrow(
        BadRequestException
      );
      expect(seasonRepo.update).not.toHaveBeenCalled();
    });

    it('refuses files that would close before their submissions, or while they stay open', async () => {
      await expect(
        service.setSubmissionDeadlines('season-1', { posterSubmissionsCloseAt: filesClose, posterFilesCloseAt: closes })
      ).rejects.toThrow('File uploads for the poster competition cannot close before its submissions do.');
      await expect(service.setSubmissionDeadlines('season-1', { presentationFilesCloseAt: closes })).rejects.toThrow(
        BadRequestException
      );
      expect(seasonRepo.update).not.toHaveBeenCalled();
    });

    it('answers not found for a season that does not exist', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.setSubmissionDeadlines('missing', {})).rejects.toThrow(NotFoundException);
    });

    /** #2962: paper and cartography have the same pair, saved and checked the same way. */
    it('saves the paper and cartography moments too', async () => {
      await service.setSubmissionDeadlines('season-1', {
        paperSubmissionsCloseAt: closes,
        paperFilesCloseAt: filesClose,
        cartographySubmissionsCloseAt: closes,
        cartographyFilesCloseAt: filesClose
      });

      expect(seasonRepo.update).toHaveBeenCalledWith(
        'season-1',
        expect.objectContaining({
          paperSubmissionsCloseAt: new Date(closes),
          paperFilesCloseAt: new Date(filesClose),
          cartographySubmissionsCloseAt: new Date(closes),
          cartographyFilesCloseAt: new Date(filesClose)
        })
      );
    });

    it.each(['paper', 'cartography'])('refuses %s files that would close before its submissions', async (type) => {
      await expect(
        service.setSubmissionDeadlines('season-1', {
          [`${type}SubmissionsCloseAt`]: filesClose,
          [`${type}FilesCloseAt`]: closes
        } as never)
      ).rejects.toThrow(`File uploads for the ${type} competition cannot close before its submissions do.`);
      await expect(
        service.setSubmissionDeadlines('season-1', { [`${type}SubmissionsCloseAt`]: 'next Friday' } as never)
      ).rejects.toThrow(`${type}SubmissionsCloseAt is not a date.`);
      expect(seasonRepo.update).not.toHaveBeenCalled();
    });

    /** Every moment the rules name is a column on the season, so none is accepted by the API and then lost. */
    it('has a column on the season for every deadline the rules name', () => {
      const columns = getMetadataArgsStorage()
        .columns.filter((c) => c.target === Season)
        .map((c) => c.propertyName);

      expect(columns).toEqual(expect.arrayContaining([...SUBMISSION_DEADLINE_FIELDS]));
      expect(SUBMISSION_DEADLINE_FIELDS).toEqual(
        expect.arrayContaining([
          'paperSubmissionsCloseAt',
          'paperFilesCloseAt',
          'cartographySubmissionsCloseAt',
          'cartographyFilesCloseAt'
        ])
      );
    });
  });

  /** #2948: which research competitions a season runs, set from the competitions' admin page, one row each. */
  describe('.setCompetitionTypes()', () => {
    let manager: { find: jest.Mock; delete: jest.Mock; save: jest.Mock; create: jest.Mock };
    /** The season's rows before the save. */
    let rows: Array<Partial<SeasonCompetition>>;

    beforeEach(() => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue({ guid: 'season-1' } as Season);
      rows = [];
      manager = {
        find: jest.fn(async () => rows),
        delete: jest.fn().mockResolvedValue({ affected: 0 }),
        save: jest.fn(async (_entity, saved) => saved),
        create: jest.fn((_entity, row) => row)
      };
      (seasonRepo.manager.transaction as jest.Mock).mockImplementation(async (work) => work(manager));
    });

    it("marks the competitions it runs, in the admin page's order", async () => {
      await expect(service.setCompetitionTypes('season-1', ['presentation', 'poster'])).resolves.toEqual({
        competitionTypes: ['poster', 'presentation']
      });
      expect(manager.save).toHaveBeenCalledWith(SeasonCompetition, [
        { season: { guid: 'season-1' }, competitionType: 'poster', runs: true },
        { season: { guid: 'season-1' }, competitionType: 'presentation', runs: true }
      ]);
    });

    // #3019: a competition's settings live on its row, so turning it off, or running every one, keeps them.
    it("keeps each competition's settings when it is turned off, and drops a row left with nothing", async () => {
      rows = [
        { guid: 'r-poster', competitionType: 'poster', runs: true, sessionGuid: 'e-1' },
        { guid: 'r-paper', competitionType: 'paper', runs: true }
      ];

      await service.setCompetitionTypes('season-1', ['presentation']);

      expect(manager.delete).toHaveBeenCalledWith(SeasonCompetition, ['r-paper']);
      expect(manager.save).toHaveBeenCalledWith(SeasonCompetition, [
        { guid: 'r-poster', competitionType: 'poster', runs: null, sessionGuid: 'e-1' },
        { season: { guid: 'season-1' }, competitionType: 'presentation', runs: true }
      ]);
    });

    it('saves every competition as no row that runs, so a competition added later runs too', async () => {
      rows = [{ guid: 'r-poster', competitionType: 'poster', runs: true, sessionGuid: 'e-1' }];

      await service.setCompetitionTypes('season-1', ['poster', 'presentation', 'paper', 'cartography']);

      expect(manager.save).toHaveBeenCalledWith(SeasonCompetition, [
        { guid: 'r-poster', competitionType: 'poster', runs: null, sessionGuid: 'e-1' }
      ]);
    });

    it.each([
      [[], 'A season must run at least one competition.'],
      [['poster', 'vgi'], 'vgi is not a competition.'],
      ['poster', 'The competitions must be a list.']
    ])('refuses %j, and saves nothing', async (competitions, message) => {
      await expect(service.setCompetitionTypes('season-1', competitions)).rejects.toThrow(new BadRequestException(message));
      expect(seasonRepo.manager.transaction).not.toHaveBeenCalled();
    });

    it('answers not found for a season that does not exist', async () => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(null);

      await expect(service.setCompetitionTypes('missing', ['poster'])).rejects.toThrow(NotFoundException);
    });
  });

  // #3019, decided 6A and 7A: each competition's sessions and its finalists date, on its row.
  describe('.setCompetitionSettings()', () => {
    let manager: { find: jest.Mock; save: jest.Mock; create: jest.Mock };
    let rows: Array<Partial<SeasonCompetition>>;
    /** The season's own sessions. */
    const events = [{ guid: 'e-poster' }, { guid: 'e-awards' }];

    beforeEach(() => {
      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue({ guid: 'season-1' } as Season);
      rows = [];
      manager = {
        find: jest.fn(async (entity) => (entity === SeasonCompetition ? rows : events)),
        save: jest.fn(async (_entity, saved) => saved),
        create: jest.fn((_entity, row) => row)
      };
      (seasonRepo.manager.transaction as jest.Mock).mockImplementation(async (work) => work(manager));
    });

    it("saves a competition's sessions and finalists date on a row of its own that runs nothing", async () => {
      await service.setCompetitionSettings('season-1', [
        {
          competitionType: 'poster',
          sessionGuid: 'e-poster',
          awardsSessionGuid: 'e-awards',
          finalistsNotifiedAt: '2027-11-13T18:00:00.000Z'
        }
      ]);

      expect(manager.save).toHaveBeenCalledWith(SeasonCompetition, [
        {
          season: { guid: 'season-1' },
          competitionType: 'poster',
          runs: null,
          sessionGuid: 'e-poster',
          graduateSessionGuid: null,
          awardsSessionGuid: 'e-awards',
          finalistsNotifiedAt: new Date('2027-11-13T18:00:00.000Z')
        }
      ]);
    });

    it('keeps whether the season runs the competition when its settings change', async () => {
      rows = [{ guid: 'r-poster', competitionType: 'poster', runs: true }];

      await service.setCompetitionSettings('season-1', [{ competitionType: 'poster', sessionGuid: null }]);

      expect(manager.save).toHaveBeenCalledWith(SeasonCompetition, [
        expect.objectContaining({ guid: 'r-poster', runs: true, sessionGuid: null })
      ]);
    });

    it.each([
      [[{ competitionType: 'poster', sessionGuid: 'e-elsewhere' }], "e-elsewhere is not one of this season's sessions."],
      [[{ competitionType: 'vgi' }], 'vgi is not a competition.'],
      [[{ competitionType: 'poster', finalistsNotifiedAt: 'soon' }], 'The poster finalists date is not a date.'],
      ['poster', 'The settings must be a list.']
    ])('refuses %j, and saves nothing', async (settings, message) => {
      await expect(service.setCompetitionSettings('season-1', settings)).rejects.toThrow(new BadRequestException(message));
      expect(manager.save).not.toHaveBeenCalled();
    });
  });
});
