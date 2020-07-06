import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { CategoryValuesService } from './category-values.service';

describe('CategoryValuesService', () => {
  let service: CategoryValuesService;
  let CategoryValueRepo: MockType<Repository<CategoryValue>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService, { provide: getRepositoryToken(CategoryValue), useFactory: repositoryMockFactory }]
    }).compile();

    service = module.get<CategoryValuesService>(CategoryValuesService);
    CategoryValueRepo = module.get(getRepositoryToken(CategoryValue));
  });

  describe('Validation ', () => {
    it('service should be defined', () => {
      expect(service).toBeDefined();
    });
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
