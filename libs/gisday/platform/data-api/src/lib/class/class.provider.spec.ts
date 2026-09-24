import { UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { firstValueFrom, isObservable } from 'rxjs';
import { Repository } from 'typeorm';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { CheckIn, Class } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { ClassProvider } from './class.provider';

describe('ClassProvider', () => {
  let provider: ClassProvider;
  let classRepo: Repository<Class>;
  let checkinRepo: Repository<CheckIn>;
  let seasonService: SeasonService;
  let management: ManagementService;

  const queryBuilder = (result: unknown, kind: 'getOne' | 'getRawMany' = 'getOne') => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['leftJoinAndSelect', 'select', 'addSelect', 'where', 'groupBy']) {
      qb[m] = jest.fn(() => qb);
    }
    qb.getOne = jest.fn().mockResolvedValue(kind === 'getOne' ? result : null);
    qb.getRawMany = jest.fn().mockResolvedValue(kind === 'getRawMany' ? result : []);
    return qb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassProvider,
        {
          provide: getRepositoryToken(Class),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), createQueryBuilder: jest.fn() }
        },
        { provide: getRepositoryToken(CheckIn), useValue: { createQueryBuilder: jest.fn() } },
        { provide: ManagementService, useValue: { getUserMetadata: jest.fn() } },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    provider = module.get<ClassProvider>(ClassProvider);
    classRepo = module.get(getRepositoryToken(Class));
    checkinRepo = module.get(getRepositoryToken(CheckIn));
    seasonService = module.get(SeasonService);
    management = module.get(ManagementService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getClassesForSeason()', () => {
    it('scopes to the season and orders by title', async () => {
      jest.spyOn(classRepo, 'find').mockResolvedValue([{ guid: 'c-1' } as Class]);

      await expect(provider.getClassesForSeason('season-1')).resolves.toEqual([{ guid: 'c-1' }]);
      expect(classRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        order: { title: 'ASC' }
      });
    });
  });

  describe('.createClass()', () => {
    /**
     * A class is identified by code, number and professor rather than by guid, so creating one
     * that already exists returns the existing row instead of a duplicate. That makes the endpoint
     * idempotent, which matters because students self-register against a class that may already
     * have been created by someone else.
     */
    it('returns the existing class rather than creating a duplicate', async () => {
      const existing = { guid: 'c-existing', code: 'GEOG', number: '476' } as unknown as Class;
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(existing);
      const create = jest.spyOn(classRepo, 'create');

      await expect(
        provider.createClass({ code: 'GEOG', number: '476', professorName: 'Goldberg' } as Class)
      ).resolves.toBe(existing);
      expect(create).not.toHaveBeenCalled();
    });

    it('matches on code, number and professor together', async () => {
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'create').mockReturnValue({ save: jest.fn() } as never);

      await provider.createClass({ code: 'GEOG', number: '476', professorName: 'Goldberg' } as Class);

      expect(classRepo.findOne).toHaveBeenCalledWith({
        where: { code: 'GEOG', number: '476', professorName: 'Goldberg' }
      });
    });

    it('drops a caller-supplied guid when creating', async () => {
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'create').mockReturnValue({ save: jest.fn() } as never);

      await provider.createClass({ guid: 'c-hijack', code: 'GEOG' } as Class);

      expect((classRepo.create as jest.Mock).mock.calls[0][0].guid).toBeUndefined();
    });
  });

  describe('.copyClassesIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.copyClassesIntoSeason('missing', ['c-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    /**
     * Regression coverage.
     *
     * The guard was `if (!classes)`. `find` resolves to an array and never null, so it never fired:
     * copying guids that match nothing answered 200 with an empty list. The message also said
     * "Events not found" in a class provider, copy-pasted from elsewhere.
     */
    it('reports that there was nothing to copy rather than succeeding silently', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(classRepo, 'find').mockResolvedValue([]);
      const create = jest.spyOn(classRepo, 'create');

      await expect(provider.copyClassesIntoSeason('season-2', ['missing'])).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('strips identity, the old season and the roster off the copy', async () => {
      const source = {
        guid: 'c-1',
        created: new Date(),
        updated: new Date(),
        title: 'Intro to GIS',
        season: { guid: 'season-1' },
        students: [{ guid: 'uc-1' }]
      } as unknown as Class;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(classRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(classRepo, 'create')
        .mockImplementation((c) => ({ ...(c as object), save: jest.fn().mockResolvedValue(c) }) as never);

      await provider.copyClassesIntoSeason('season-2', ['c-1']);

      const passed = (classRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      // The roster belongs to the original class; carrying it would move the students across.
      expect(passed.students).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      expect(passed.title).toBe('Intro to GIS');
    });
  });

  describe('.getClassStudents()', () => {
    it('returns the roster for the class', async () => {
      jest
        .spyOn(classRepo, 'findOne')
        .mockResolvedValue({ guid: 'c-1', students: [{ guid: 'uc-1' }] } as unknown as Class);

      await expect(provider.getClassStudents('c-1')).resolves.toEqual([{ guid: 'uc-1' }]);
    });

    it('answers an empty roster for a class that does not exist', async () => {
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getClassStudents('missing')).resolves.toEqual([]);
    });
  });

  describe('.getSimplifiedAttendance()', () => {
    /**
     * Regression coverage.
     *
     * `getOne()` resolves null for a guid that matches nothing, and the next line read
     * `cl.students` off it -- a TypeError, surfacing as 500. `getClassStudents` directly above
     * guards the same case and answers an empty list, which is what makes this an oversight.
     */
    it('answers an empty roster for a class that does not exist', async () => {
      jest.spyOn(classRepo, 'createQueryBuilder').mockReturnValue(queryBuilder(null) as never);

      await expect(provider.getSimplifiedAttendance('missing')).resolves.toEqual([]);
    });

    it('answers an empty roster for a class with no students', async () => {
      jest
        .spyOn(classRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder({ guid: 'c-1', students: [] }) as never);

      await expect(provider.getSimplifiedAttendance('c-1')).resolves.toEqual([]);
    });

    it('builds a roster row per student with their attendance count', async () => {
      jest.spyOn(classRepo, 'createQueryBuilder').mockReturnValue(
        queryBuilder({ guid: 'c-1', students: [{ accountGuid: 'acct-1' }] }) as never
      );
      jest
        .spyOn(checkinRepo, 'createQueryBuilder')
        .mockReturnValue(
          queryBuilder([{ checkin_accountGuid: 'acct-1', checkinCount: 3 }], 'getRawMany') as never
        );
      jest.spyOn(management, 'getUserMetadata').mockResolvedValue({
        user_info: { id: 'acct-1', given_name: 'Ada', family_name: 'Lovelace', email: 'ada@tamu.edu' },
        user_metadata: { education: { id: '123456789' } }
      } as never);

      const result = await provider.getSimplifiedAttendance('c-1');
      const roster = isObservable(result) ? await firstValueFrom(result) : result;

      expect(roster).toEqual([
        {
          gisday_id: 'acct-1',
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@tamu.edu',
          uin: '123456789',
          events_attended: 3
        }
      ]);
    });

    it('still lists a student whose profile lookup fails', async () => {
      jest.spyOn(classRepo, 'createQueryBuilder').mockReturnValue(
        queryBuilder({ guid: 'c-1', students: [{ accountGuid: 'acct-1' }] }) as never
      );
      jest
        .spyOn(checkinRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder([], 'getRawMany') as never);
      // A roster is for an instructor to mark attendance from. One unreachable Auth0 profile must
      // not take the whole roster down.
      jest.spyOn(management, 'getUserMetadata').mockRejectedValue(new Error('auth0 unreachable'));

      const result = await provider.getSimplifiedAttendance('c-1');
      const roster = isObservable(result) ? await firstValueFrom(result) : result;

      expect(roster).toEqual([
        expect.objectContaining({ gisday_id: 'acct-1', first_name: 'N/A', events_attended: 0 })
      ]);
    });

    it('reports zero attendance for a student with no check-ins', async () => {
      jest.spyOn(classRepo, 'createQueryBuilder').mockReturnValue(
        queryBuilder({ guid: 'c-1', students: [{ accountGuid: 'acct-2' }] }) as never
      );
      jest
        .spyOn(checkinRepo, 'createQueryBuilder')
        .mockReturnValue(
          queryBuilder([{ checkin_accountGuid: 'acct-other', checkinCount: 5 }], 'getRawMany') as never
        );
      jest
        .spyOn(management, 'getUserMetadata')
        .mockResolvedValue({ user_info: { id: 'acct-2' } } as never);

      const result = await provider.getSimplifiedAttendance('c-1');
      const roster = isObservable(result) ? await firstValueFrom(result) : result;

      expect(roster).toEqual([expect.objectContaining({ events_attended: 0 })]);
    });
  });
});
