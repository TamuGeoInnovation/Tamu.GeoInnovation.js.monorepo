import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userMockRepo: Repository<User>;
  let testingSiteMockRepo: Repository<TestingSite>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(TestingSite), useClass: Repository }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userMockRepo = module.get(getRepositoryToken(User));
    testingSiteMockRepo = module.get(getRepositoryToken(TestingSite));
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(usersService).toBeDefined();
    });
  });

  /* Implementation Testing?
  describe('getUsers', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(userMockRepo, 'find').mockResolvedValue(expectedResult);
      expect(await usersService.getUsers()).toEqual(expectedResult);
    });
  });
  */

  describe('verifyEmail', () => {
    it('should handle missing inputs ', async () => {
      const mockParameterUndefined = undefined;
      const mockParameterEmptyString = '';
      const expectedResult = {
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      };
      expect(await usersService.verifyEmail(mockParameterEmptyString)).toMatchObject(expectedResult);
      expect(await usersService.verifyEmail(mockParameterUndefined)).toMatchObject(expectedResult);
    });
    /* Implementation Testing?
    it('should handle no existing user ', async () => {
      const mockParameter = 'Foobar';
      const mockParameterUndefined = undefined;
      const expectedResult = {
        statusCode: 400,
        success: false,
        message: 'Email not found'
      };
      jest.spyOn(userMockRepo, 'findOne').mockResolvedValue(mockParameterUndefined);
      expect(await usersService.verifyEmail(mockParameter)).toMatchObject(expectedResult);
    });*/

    /* Implementation Testing?
    it('should return user if findOne returns, and if email length > 0 ', async () => {
      const mockParameter = 'Foobar';
      const expectedResult = new User();
      jest.spyOn(userMockRepo, 'findOne').mockResolvedValue(expectedResult);
      expect(await usersService.verifyEmail(mockParameter)).toEqual(expectedResult);
    });*/
  });

  describe('registerEmail', () => {
    it('should handle missing inputs ', async () => {
      const mockParameterUndefined = undefined;
      const mockParameterEmptyString = '';
      const expectedResult = {
        status: 500,
        success: false,
        message: 'Input parameter missing'
      };
      expect(await usersService.registerEmail(mockParameterEmptyString)).toMatchObject(expectedResult);
      expect(await usersService.registerEmail(mockParameterUndefined)).toMatchObject(expectedResult);
    });

    /* Implementation Testing?
    it('should return user if findOne returns, and if email length > 0 ', async () => {
      const mockParameter = 'foobar';
      const expectedResult = new User();
      jest.spyOn(userMockRepo, 'findOne').mockResolvedValue(expectedResult);
      expect(await usersService.registerEmail(mockParameter)).toEqual(expectedResult);
    });*/
  });
});
