import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MailroomEmail } from '@tamu-gisc/mailroom/common';
import { Repository } from 'typeorm';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let repo: Repository<MailroomEmail>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getRepositoryToken(MailroomEmail),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<EmailService>(EmailService);
    repo = module.get(getRepositoryToken(MailroomEmail));
  });

  describe('Validation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('EmailService', () => {
    describe('.getAllEmails()', () => {
      it('should return an array of MailroomEmail', async () => {
        // Set a mock on the repo's find() method; it'll return an array
        const spy = jest.spyOn(repo, 'find').mockResolvedValue([]);

        // Call service's getAllEmails(); this will actually trigger our mock instead thanks to our spy
        const emails = await service.getAllEmails();

        // Make sure the spy was called and make sure emails is an array
        expect(emails).toEqual([]);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('.getEmail()', () => {
      it('should: return instance of MailroomEmail; call findOne with attachments relation and where clause with id param', async () => {
        const mockParam = {
          id: '1'
        };

        // Set a mock on repo's findOne(); this will return an instance of MailroomEmail
        const spy = jest.spyOn(repo, 'findOne').mockResolvedValue(new MailroomEmail());

        // Call service's getEmail() method providing any parameters
        const email = await service.getEmail(mockParam.id);

        // Assert the value returned by getEmail() is of type MailroomEmail
        expect(email).toBeInstanceOf(MailroomEmail);
        // Assert that the findOne() method was called with the right relations table (attachments) and with the provided id
        expect(spy).toHaveBeenCalledWith({
          relations: ['attachments'],
          where: {
            // getEmail() does parseInt(id, 10), so the repository receives a number.
            id: Number(mockParam.id)
          }
        });
      });
    });

    describe('.deleteEmail', () => {
      /**
       * The previous version asserted only that `remove()` was called with the object `findOne()`
       * returned. `findOne` was mocked with `mockResolvedValue`, so every call handed back the same
       * instance -- which held whether or not `deleteEmail` passed the id along. It did not: it
       * looked up `where: {}` and deleted an arbitrary row.
       *
       * These assert against the criteria rather than the returned object, so the id has to reach
       * the repository for them to pass.
       */
      it('looks the email up by the id it was given', async () => {
        const spyFind = jest.spyOn(repo, 'findOne').mockResolvedValue(new MailroomEmail());
        jest.spyOn(repo, 'remove').mockResolvedValue(new MailroomEmail());

        await service.deleteEmail('1');

        expect(spyFind).toHaveBeenCalledWith({
          relations: ['attachments'],
          // deleteEmail() does parseInt(id, 10), so the repository receives a number.
          where: { id: 1 }
        });
      });

      it('deletes the email matching the id rather than whichever row comes back first', async () => {
        // Distinct ids matter: `toHaveBeenCalledWith` compares structurally, so two bare
        // `new MailroomEmail()` instances are indistinguishable to it.
        const requested = Object.assign(new MailroomEmail(), { id: 7 });
        const someOtherEmail = Object.assign(new MailroomEmail(), { id: 1 });

        // Answer the way a real repository would: only the matching id yields the requested row.
        jest.spyOn(repo, 'findOne').mockImplementation((options) => {
          const where = (options as { where: { id: number } }).where;

          return Promise.resolve(where?.id === 7 ? requested : someOtherEmail);
        });
        const spyRemove = jest.spyOn(repo, 'remove').mockResolvedValue(requested);

        await service.deleteEmail('7');

        expect(spyRemove).toHaveBeenCalledWith(requested);
        expect(spyRemove).not.toHaveBeenCalledWith(someOtherEmail);
      });

      it('should return a boolean indicating the status of the remove() operation', async () => {
        jest.spyOn(repo, 'findOne').mockResolvedValue(new MailroomEmail());
        const spyRemove = jest.spyOn(repo, 'remove').mockResolvedValue(new MailroomEmail());

        await expect(service.deleteEmail('1')).resolves.toBe(true);
        expect(spyRemove).toHaveBeenCalled();
      });

      it('reports false and removes nothing when no email has that id', async () => {
        jest.spyOn(repo, 'findOne').mockResolvedValue(null);
        const spyRemove = jest.spyOn(repo, 'remove');

        // `remove(undefined)` throws, so this used to be a 500 rather than a negative result.
        await expect(service.deleteEmail('404')).resolves.toBe(false);
        expect(spyRemove).not.toHaveBeenCalled();
      });
    });
  });
});
