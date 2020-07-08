import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from '../users/users.service';

jest.mock('../users/users.service');

describe('Users Controller', () => {
  let usersService: UsersService;
  let usersController: UsersController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService]
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    usersController = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(usersController).toBeDefined();
    });
  });

  describe('verifyEmail', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      };
      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(expectedResult);
      expect(await usersController.verifyEmail(mockParameters)).toBe(expectedResult);
    });
  });

  describe('Get Users', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(usersService, 'getUsers').mockResolvedValue(expectedResult);
      expect(await usersController.getUsers()).toBe(expectedResult);
    });
    it('should return expectedResult', async () => {
      const expectedResult = { message: '', status: 500, success: false };
      jest.spyOn(usersService, 'getUsers').mockImplementation(() => {
        throw new Error();
      });
      expect(await usersController.getUsers()).toStrictEqual(expectedResult);
    });
  });

  describe('getUsersWithStats', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(usersService, 'getUsersWithStats').mockResolvedValue(expectedResult);
      expect(await usersController.getUsersWithStats()).toBe(expectedResult);
    });
    it('should handle Error thrown from service.getUsersWithStats', async () => {
      const expectedResult = { message: '', status: 500, success: false };
      jest.spyOn(usersService, 'getUsersWithStats').mockImplementation(() => {
        throw new Error();
      });
      expect(await usersController.getUsersWithStats()).toStrictEqual(expectedResult);
    });
  });

  describe('getUsers', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(usersService, 'getUsers').mockResolvedValue(expectedResult);
      expect(await usersController.getUsers()).toBe(expectedResult);
    });
    it('should handle Error thrown from service.getUsers', async () => {
      const expectedResult = { message: '', status: 500, success: false };

      jest.spyOn(usersService, 'getUsers').mockImplementation(() => {
        throw new Error();
      });
      expect(await usersController.getUsers()).toStrictEqual(expectedResult);
    });
  });

  describe('registerEmail', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {
        status: 500,
        success: false,
        message: 'Input parameter missing'
      };
      jest.spyOn(usersService, 'registerEmail').mockResolvedValue(expectedResult);
      expect(await usersController.registerEmail(mockParameters)).toBe(expectedResult);
    });
  });
});
