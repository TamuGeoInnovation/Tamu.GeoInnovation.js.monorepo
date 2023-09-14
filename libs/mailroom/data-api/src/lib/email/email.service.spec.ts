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
            id: mockParam.id
          }
        });
      });
    });

    describe('.deleteEmail', () => {
      it('should return a boolean indicating the status of the remove() operation', async () => {
        const mockParam = {
          id: '1'
        };

        // Set a mock on repo's findOne(); this will return the instance of MailroomEmail we wanna delete
        const spyFind = jest.spyOn(repo, 'findOne').mockResolvedValue(new MailroomEmail());
        // Call service's getEmail() method providing any parameters; our spy will handle this call
        const email = await service.getEmail(mockParam.id);

        // Assert the result of getEmail() is an instance of MailroomEmail
        expect(email).toBeInstanceOf(MailroomEmail);
        // Assert that the findOne() method was called with the right relations table and with the provided id
        expect(spyFind).toHaveBeenCalledWith({
          relations: ['attachments'],
          where: {
            id: mockParam.id
          }
        });

        // Set mock on the repo's remove(); this will return the removed MailroomEmail instance
        const spyRemove = jest.spyOn(repo, 'remove').mockResolvedValue(new MailroomEmail());
        // Call service's deleteEmail() method with the id
        const wasRemoved = await service.deleteEmail(mockParam.id);

        // Assert we got a truthy value back from deleteEmail()
        expect(wasRemoved).toBeTruthy();
        // Assert we called repo remove() with the email we found earlier given an id
        expect(spyRemove).toHaveBeenCalledWith(email);
      });
    });
  });
});
