import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { Class, UserClass } from '../entities/all.entity';
import { UserClassProvider } from './user-class.provider';

describe('UserClassProvider', () => {
  let provider: UserClassProvider;
  let userClassRepo: Repository<UserClass>;
  let classRepo: Repository<Class>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserClassProvider,
        {
          provide: getRepositoryToken(UserClass),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
          }
        },
        { provide: getRepositoryToken(Class), useValue: { findOne: jest.fn() } }
      ]
    }).compile();

    provider = module.get<UserClassProvider>(UserClassProvider);
    userClassRepo = module.get(getRepositoryToken(UserClass));
    classRepo = module.get(getRepositoryToken(Class));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.insertUserClass()', () => {
    it('refuses a second registration for the same class', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue({ guid: 'uc-1' } as UserClass);

      await expect(provider.insertUserClass('c-1', 'acct-1')).rejects.toThrow(BadRequestException);
    });

    it('scopes the duplicate check to this user and this class', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'findOne').mockResolvedValue({ guid: 'c-1' } as Class);
      jest.spyOn(userClassRepo, 'create').mockReturnValue({} as never);
      jest.spyOn(userClassRepo, 'save').mockResolvedValue({} as never);

      await provider.insertUserClass('c-1', 'acct-1');

      expect(userClassRepo.findOne).toHaveBeenCalledWith({
        where: { accountGuid: 'acct-1', class: { guid: 'c-1' } }
      });
    });

    /**
     * Regression coverage.
     *
     * The class lookup result was passed straight into `create` with no guard. A guid matching no
     * class produced a registration with a null class: a row tied to the student but to no class,
     * so it could never show up on a roster and the student appeared unregistered while a stray
     * row accumulated in the table.
     */
    it('rejects a registration for a class that does not exist, rather than writing an orphan', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(null);
      const save = jest.spyOn(userClassRepo, 'save');

      await expect(provider.insertUserClass('missing', 'acct-1')).rejects.toThrow(NotFoundException);
      expect(save).not.toHaveBeenCalled();
    });

    it('registers the user against the resolved class', async () => {
      const cl = { guid: 'c-1' } as Class;
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'findOne').mockResolvedValue(cl);
      jest.spyOn(userClassRepo, 'create').mockImplementation((u) => ({ ...(u as object) }) as never);
      jest.spyOn(userClassRepo, 'save').mockImplementation((u) => Promise.resolve(u as never));

      await provider.insertUserClass('c-1', 'acct-1');

      expect(userClassRepo.create).toHaveBeenCalledWith({ class: cl, accountGuid: 'acct-1' });
    });

    /**
     * Regression coverage.
     *
     * The save was returned from inside the `try` without being awaited, so its rejection settled
     * outside the block and the catch never ran.
     */
    it('translates a failed write into a 500 with its own message', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(classRepo, 'findOne').mockResolvedValue({ guid: 'c-1' } as Class);
      jest.spyOn(userClassRepo, 'create').mockReturnValue({} as never);
      jest.spyOn(userClassRepo, 'save').mockRejectedValue(new Error('connection reset'));

      await expect(provider.insertUserClass('c-1', 'acct-1')).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('.getUserClasses()', () => {
    it('scopes the lookup to the account', async () => {
      jest.spyOn(userClassRepo, 'find').mockResolvedValue([]);

      await provider.getUserClasses('acct-1');

      expect(userClassRepo.find).toHaveBeenCalledWith({ where: { accountGuid: 'acct-1' } });
    });
  });

  describe('.deleteUserClassRegistration()', () => {
    it('reports not found when the registration does not exist', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.deleteUserClassRegistration('c-1', 'acct-1')).rejects.toThrow(
        NotFoundException
      );
    });

    // The lookup is already scoped to the account, so another user's registration reads as absent
    // and answers 404 rather than 403 -- which is also what stops one user deleting another's.
    it('does not find a registration belonging to a different account', async () => {
      jest.spyOn(userClassRepo, 'findOne').mockResolvedValue(null);
      const del = jest.spyOn(userClassRepo, 'delete');

      await expect(provider.deleteUserClassRegistration('c-1', 'acct-other')).rejects.toThrow(
        NotFoundException
      );
      expect(userClassRepo.findOne).toHaveBeenCalledWith({
        where: { class: { guid: 'c-1' }, accountGuid: 'acct-other' }
      });
      expect(del).not.toHaveBeenCalled();
    });

    it('deletes by the registration guid, not the class guid', async () => {
      jest
        .spyOn(userClassRepo, 'findOne')
        .mockResolvedValue({ guid: 'uc-1', accountGuid: 'acct-1' } as UserClass);
      jest.spyOn(userClassRepo, 'delete').mockResolvedValue({ affected: 1 } as never);

      await provider.deleteUserClassRegistration('c-1', 'acct-1');

      expect(userClassRepo.delete).toHaveBeenCalledWith('uc-1');
    });
  });
});
