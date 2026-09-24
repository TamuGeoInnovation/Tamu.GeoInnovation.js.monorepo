import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { Event, RsvpType, UserRsvp } from '../entities/all.entity';
import { UserRsvpProvider } from './user-rsvp.provider';

describe('UserRsvpProvider', () => {
  let provider: UserRsvpProvider;
  let rsvpRepo: Repository<UserRsvp>;
  let eventRepo: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRsvpProvider,
        {
          provide: getRepositoryToken(UserRsvp),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() }
        },
        { provide: getRepositoryToken(Event), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(RsvpType), useValue: { findOne: jest.fn() } }
      ]
    }).compile();

    provider = module.get<UserRsvpProvider>(UserRsvpProvider);
    rsvpRepo = module.get(getRepositoryToken(UserRsvp));
    eventRepo = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getUserRsvpForEvent()', () => {
    it('scopes the lookup to both the event and the attendee', async () => {
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue({ guid: 'r-1' } as UserRsvp);

      await expect(provider.getUserRsvpForEvent('acct-1', 'e-1')).resolves.toEqual({ guid: 'r-1' });
      expect(rsvpRepo.findOne).toHaveBeenCalledWith({
        where: { event: { guid: 'e-1' }, accountGuid: 'acct-1' }
      });
    });

    it('throws NotFound when the attendee has not RSVPed', async () => {
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getUserRsvpForEvent('acct-1', 'e-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('.insertUserRsvp()', () => {
    it('creates the RSVP against the resolved event', async () => {
      const event = { guid: 'e-1' } as Event;
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(rsvpRepo, 'create').mockImplementation((e) => e as never);
      jest.spyOn(rsvpRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.insertUserRsvp('e-1', null, 'acct-1');

      expect(rsvpRepo.create).toHaveBeenCalledWith({ event, accountGuid: 'acct-1' });
      expect(rsvpRepo.save).toHaveBeenCalled();
    });

    /**
     * Regression coverage.
     *
     * The event lookup's result was never checked. When it resolved `null`, the method carried on
     * and created an RSVP with `event: null` -- the relation is nullable -- so posting a guid that
     * matches no event answered 201 and left an orphan row behind.
     *
     * `CheckInProvider.insertUserCheckin` guards exactly this case, which is what makes the
     * omission here an oversight rather than a decision.
     */
    it('refuses to RSVP to an event that does not exist', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);
      const create = jest.spyOn(rsvpRepo, 'create');
      const save = jest.spyOn(rsvpRepo, 'save');

      await expect(provider.insertUserRsvp('missing', null, 'acct-1')).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(create).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    /**
     * Regression coverage.
     *
     * The duplicate case raised a bare `Error`, which the catch below it wrapped as
     * `InternalServerErrorException` -- so RSVPing twice answered 500 rather than telling the
     * caller it had already happened. `CheckInProvider` answers 422 for the same situation.
     */
    it('answers 422, not 500, when the attendee has already RSVPed', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ guid: 'e-1' } as Event);
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue({ guid: 'r-existing' } as UserRsvp);
      const save = jest.spyOn(rsvpRepo, 'save');

      await expect(provider.insertUserRsvp('e-1', null, 'acct-1')).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(save).not.toHaveBeenCalled();
    });

    /**
     * `rsvpTypeGuid` is accepted by this method, passed through by the controller, and never used.
     * `RsvpType` is a real entity with an eager relation on `UserRsvp` and a full admin CRUD
     * surface, but the front end's `createRsvp(eventGuid)` sends only the event, the controller
     * defaults the type to `null`, and nothing here reads it -- so every RSVP is stored without
     * one.
     *
     * That is an unfinished feature rather than lost data, so it is recorded here rather than
     * changed. Wiring it up is a product decision.
     */
    it('ignores the rsvp type it is given', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ guid: 'e-1' } as Event);
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(rsvpRepo, 'create').mockImplementation((e) => e as never);
      jest.spyOn(rsvpRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.insertUserRsvp('e-1', 'type-attending', 'acct-1');

      expect(rsvpRepo.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ rsvpType: expect.anything() })
      );
    });
  });

  describe('.getUserRsvps()', () => {
    it('scopes to the account and loads the events', async () => {
      jest.spyOn(rsvpRepo, 'find').mockResolvedValue([{ guid: 'r-1' } as UserRsvp]);

      await expect(provider.getUserRsvps('acct-1')).resolves.toEqual([{ guid: 'r-1' }]);
      expect(rsvpRepo.find).toHaveBeenCalledWith({
        where: { accountGuid: 'acct-1' },
        relations: ['event']
      });
    });
  });

  describe('.deleteRsvpForUser()', () => {
    it('removes the RSVP for that attendee and event', async () => {
      const remove = jest.fn().mockResolvedValue({ guid: 'r-1' });
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue({ guid: 'r-1', remove } as never);

      await expect(provider.deleteRsvpForUser('e-1', 'acct-1')).resolves.toEqual({ guid: 'r-1' });
      expect(rsvpRepo.findOne).toHaveBeenCalledWith({
        where: { event: { guid: 'e-1' }, accountGuid: 'acct-1' }
      });
      expect(remove).toHaveBeenCalled();
    });

    it('throws NotFound rather than reporting success when there is nothing to remove', async () => {
      jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.deleteRsvpForUser('e-1', 'acct-1')).rejects.toThrow(NotFoundException);
    });

    /**
     * The lookup is scoped to the account as well as the event, so one attendee cannot cancel
     * another's RSVP by posting their event guid. Asserting it so the scoping is not dropped.
     */
    it('cannot remove another attendee\'s RSVP', async () => {
      const findOne = jest.spyOn(rsvpRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.deleteRsvpForUser('e-1', 'acct-attacker')).rejects.toThrow(
        NotFoundException
      );
      expect(findOne).toHaveBeenCalledWith({
        where: { event: { guid: 'e-1' }, accountGuid: 'acct-attacker' }
      });
    });
  });
});
