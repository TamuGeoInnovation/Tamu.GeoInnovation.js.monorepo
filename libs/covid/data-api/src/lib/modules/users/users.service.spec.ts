import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository, QueryBuilder, BaseEntity } from 'typeorm';

import { User, TestingSite, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';
import { create } from 'domain';

describe('UsersService', () => {
  let service: UsersService;
  let UserMockRepo: MockType<Repository<User>>;
  let TestingSiteMockRepo: MockType<Repository<TestingSite>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(TestingSite), useFactory: repositoryMockFactory }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    UserMockRepo = module.get(getRepositoryToken(User));
    TestingSiteMockRepo = module.get(getRepositoryToken(TestingSite));
  });

  describe('getUsers', () => {
    it('should return true if active ', async () => {
      const user = new User();
      UserMockRepo.find.mockReturnValue(user);
      expect(await service.getUsers()).toEqual(user);
    });
  });
  /*describe('getUsersWithStats', () => {
    it('should return true if active ', async () => {
      service.repo = new Repository();
      expect(await service.getUsersWithStats()).toEqual(undefined);
    });
  });*/
  describe('verifyEmail', () => {
    it('should handle missing inputs ', async () => {
      expect(await service.verifyEmail('')).toMatchObject({
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      });
      expect(await service.verifyEmail(undefined)).toMatchObject({
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      });
    });
    it('should handle no existing user ', async () => {
      UserMockRepo.findOne.mockReturnValue(undefined);
      expect(await service.verifyEmail('Foobar')).toMatchObject({
        statusCode: 400,
        success: false,
        message: 'Email not found'
      });
    });
    it('should return user if findOne returns, and if email length > 0 ', async () => {
      const user = new User();
      UserMockRepo.findOne.mockReturnValue(user);
      expect(await service.verifyEmail('foobar')).toEqual(user);
    });
  });
  describe('registerEmail', () => {
    it('should handle missing inputs ', async () => {
      expect(await service.registerEmail('')).toMatchObject({
        status: 500,
        success: false,
        message: 'Input parameter missing'
      });
      expect(await service.registerEmail(undefined)).toMatchObject({
        status: 500,
        success: false,
        message: 'Input parameter missing'
      });
    });
    it('should handle no existing user', async () => {
      const user = new User();
      UserMockRepo.findOne.mockReturnValueOnce(undefined).mockReturnValue(user);
      UserMockRepo.create.mockReturnValue(UserMockRepo);
      expect(await service.registerEmail('foobar')).toEqual(user);
    });
    it('should return user if findOne returns, and if email length > 0 ', async () => {
      const user = new User();
      UserMockRepo.findOne.mockReturnValue(user);
      expect(await service.registerEmail('foobar')).toEqual(user);
    });
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
}));
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
