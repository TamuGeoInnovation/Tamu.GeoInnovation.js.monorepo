import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from '../users/users.service';
import { throwError } from 'rxjs';

jest.mock('../users/users.service');

describe('Users Controller', () => {
  let usersService: UsersService;
  let module: TestingModule;
  let controller: UsersController;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService]
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Verify Email', () => {
    it('should return expected Result', async () => {
      const expectedResult = {
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      };
      const mockEmailToSatisfyParameters = 'yeet';
      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(expectedResult);
      expect(await controller.verifyEmail(mockEmailToSatisfyParameters)).toBe(expectedResult);
    });
  });

  describe('Register Email', () => {
    it('should return expected Result', async () => {
      const expectedResult = {
        status: 500,
        success: false,
        message: 'Input parameter missing'
      };
      const mockEmailToSatisfyParameters = 'yeet';
      jest.spyOn(usersService, 'registerEmail').mockResolvedValue(expectedResult);
      expect(await controller.registerEmail(mockEmailToSatisfyParameters)).toBe(expectedResult);
    });
  });
  describe('Get Users', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(usersService, 'getUsers').mockResolvedValue(expectedResult);
      expect(await controller.getUsers()).toBe(expectedResult);
    });
    it('should return expected Result', async () => {
      jest.spyOn(usersService, 'getUsers').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getUsers()).toStrictEqual({ message: '', status: 500, success: false });
    });
  });
  describe('getUsersWithStats', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(usersService, 'getUsersWithStats').mockResolvedValue(expectedResult);
      expect(await controller.getUsersWithStats()).toBe(expectedResult);
    });
    it('should return expected Result', async () => {
      jest.spyOn(usersService, 'getUsersWithStats').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getUsersWithStats()).toStrictEqual({ message: '', status: 500, success: false });
    });
  });
});
