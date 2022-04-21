import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(TestingSite), useClass: Repository }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(usersService).toBeDefined();
    });
  });

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
  });
});
