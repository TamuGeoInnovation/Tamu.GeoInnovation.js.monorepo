import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn()
}));
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
