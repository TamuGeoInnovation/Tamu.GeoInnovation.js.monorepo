import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesService } from './field-categories.service';

describe('FieldCategoriesService', () => {
  let service: FieldCategoriesService;
  let FieldCategoryMockRepo: MockType<Repository<FieldCategory>>;
  let FieldTypeMockRepo: MockType<Repository<FieldType>>;
  let CategoryValueMockRepo: MockType<Repository<CategoryValue>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldCategoriesService,
        { provide: getRepositoryToken(FieldCategory), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(FieldType), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CategoryValue), useFactory: repositoryMockFactory }
      ]
    }).compile();

    service = module.get<FieldCategoriesService>(FieldCategoriesService);
    FieldCategoryMockRepo = module.get(getRepositoryToken(FieldCategory));
    FieldTypeMockRepo = module.get(getRepositoryToken(FieldType));
    CategoryValueMockRepo = module.get(getRepositoryToken(CategoryValue));
  });

  describe('getFieldTypesForCategory', () => {
    it('should handle undefined inputs ', async () => {
      expect(await service.getFieldTypesForCategory(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue({});
      expect(await service.getFieldTypesForCategory(9)).toMatchObject({});
    });

    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue(undefined);
      expect(await service.getFieldTypesForCategory(9)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid category ID.'
      });
    });
  });

  describe('addFieldTypeToCategory', () => {
    it('should handle undefined inputs ', async () => {
      expect(await service.getFieldTypesForCategory(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue({});
      expect(await service.getFieldTypesForCategory(9)).toMatchObject({});
    });

    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue(undefined);
      expect(await service.getFieldTypesForCategory(9)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid category ID.'
      });
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
