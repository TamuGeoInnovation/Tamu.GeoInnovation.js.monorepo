import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { SeasonDay } from '../entities/all.entity';
import { SeasonDayService } from './season-day.service';

describe('SeasonDayService', () => {
  let service: SeasonDayService;
  let dayRepo: Repository<SeasonDay>;

  const event = (over: Record<string, unknown>) => ({
    guid: 'e-1',
    active: true,
    startTime: '09:00',
    tags: [],
    speakers: [],
    location: null,
    ...over
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonDayService,
        { provide: getRepositoryToken(SeasonDay), useValue: { findOne: jest.fn() } }
      ]
    }).compile();

    service = module.get<SeasonDayService>(SeasonDayService);
    dayRepo = module.get(getRepositoryToken(SeasonDay));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getDayEvents()', () => {
    it('throws NotFound when the day does not exist', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getDayEvents('missing')).rejects.toThrow(NotFoundException);
    });

    it('reduces tags, affiliations and places to guid lists', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [
          event({
            tags: [{ guid: 't-1' }, { guid: 't-2' }],
            speakers: [{ guid: 's-1', organization: { guid: 'o-1' } }],
            location: { guid: 'el-1', place: { guid: 'p-1' } }
          })
        ]
      } as unknown as SeasonDay);

      const [simplified] = await service.getDayEvents('d-1');

      expect(simplified.tags).toEqual(['t-1', 't-2']);
      expect(simplified.affiliations).toEqual(['o-1']);
      expect(simplified.organizations).toEqual(['p-1']);
    });

    it('drops speakers from the payload once their organizations have been collected', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [event({ speakers: [{ guid: 's-1', organization: { guid: 'o-1' } }] })]
      } as unknown as SeasonDay);

      const [simplified] = await service.getDayEvents('d-1');

      // Speakers are only loaded to derive affiliations, and are deliberately not sent on.
      expect('speakers' in simplified).toBe(false);
      expect(simplified.affiliations).toEqual(['o-1']);
    });

    it('excludes inactive events', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [
          event({ guid: 'e-hidden', active: false }),
          event({ guid: 'e-shown', active: true })
        ]
      } as unknown as SeasonDay);

      const simplified = await service.getDayEvents('d-1');

      expect(simplified.map((e) => e.guid)).toEqual(['e-shown']);
    });

    it('orders events by start time', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [
          event({ guid: 'e-late', startTime: '15:00' }),
          event({ guid: 'e-early', startTime: '08:00' }),
          event({ guid: 'e-mid', startTime: '11:30' })
        ]
      } as unknown as SeasonDay);

      const simplified = await service.getDayEvents('d-1');

      expect(simplified.map((e) => e.guid)).toEqual(['e-early', 'e-mid', 'e-late']);
    });

    it('tolerates an event with no tags and no location', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [event({ tags: undefined, location: null })]
      } as unknown as SeasonDay);

      const [simplified] = await service.getDayEvents('d-1');

      expect(simplified.tags).toEqual([]);
      expect(simplified.organizations).toEqual([]);
    });

    it('tolerates a location with no place', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [event({ location: { guid: 'el-1', place: null } })]
      } as unknown as SeasonDay);

      const [simplified] = await service.getDayEvents('d-1');

      expect(simplified.organizations).toEqual([]);
    });

    /**
     * The affiliation step filters with `s.organization !== null`, which lets `undefined` through
     * and then reads `.guid` off it. `null` is the value this codebase actually produces -- the
     * organization service nulls the field on every speaker of an organization it deletes -- so the
     * strict check covers the realistic case. This pins the looser one so the distinction is
     * recorded rather than left to chance.
     */
    it('skips a speaker whose organization is null', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue({
        guid: 'd-1',
        events: [
          event({
            speakers: [
              { guid: 's-orphan', organization: null },
              { guid: 's-1', organization: { guid: 'o-1' } }
            ]
          })
        ]
      } as unknown as SeasonDay);

      const [simplified] = await service.getDayEvents('d-1');

      expect(simplified.affiliations).toEqual(['o-1']);
    });

    it('wraps a repository failure as 500', async () => {
      jest.spyOn(dayRepo, 'findOne').mockRejectedValue(new Error('connection lost'));

      await expect(service.getDayEvents('d-1')).rejects.toThrow(InternalServerErrorException);
    });

    it('lets the NotFound through rather than converting it to 500', async () => {
      jest.spyOn(dayRepo, 'findOne').mockResolvedValue(null);

      // The NotFound is raised inside the try; the guard added in #976 is what keeps it a 404.
      await expect(service.getDayEvents('missing')).rejects.not.toThrow(InternalServerErrorException);
    });
  });
});
