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

  describe('getAllCategoriesWithTypes', () => {
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.find.mockReturnValue({});
      expect(await service.getAllCategoriesWithTypes()).toMatchObject({});
    });
  });
  describe('getCategoryWithValues', () => {
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.find.mockReturnValue({});
      expect(await service.getCategoryWithValues('y')).toMatchObject({});
    });
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
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue(undefined);
      expect(await service.addFieldTypeToCategory(undefined, undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid category.'
      });
    });

    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValueOnce({});
      expect(await service.addFieldTypeToCategory(9, 'yeet')).toMatchObject({});
    });
    /*it('should handle catagorey inputs ', async () => {
      let categ = new CategoryValue();
      categ.category = new FieldCategory();
      categ.category.types = [new FieldType()];

      FieldCategoryMockRepo.findOne.mockReturnValueOnce(categ);
      FieldTypeMockRepo.findOne.mockReturnValue(categ);

      expect(await service.addFieldTypeToCategory(9, 'yeet')).toMatchObject(categ);
    });*/
  });
  describe('addValueToCategory', () => {
    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue(undefined);
      expect(await service.addValueToCategory(undefined, undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid category.'
      });
    });

    it('should handle catagorey inputs ', async () => {
      FieldCategoryMockRepo.findOne.mockReturnValue({});
      CategoryValueMockRepo.create.mockReturnValue(CategoryValueMockRepo);

      expect(await service.addValueToCategory('foo', 'bar')).toMatchObject({});
    });
    /*it('should handle catagorey inputs ', async () => {
      let categ = new CategoryValue();
      categ.category = new FieldCategory();
      categ.category.types = [new FieldType()];

      FieldCategoryMockRepo.findOne.mockReturnValueOnce(categ);
      FieldTypeMockRepo.findOne.mockReturnValue(categ);

      expect(await service.addFieldTypeToCategory(9, 'yeet')).toMatchObject(categ);
    });*/
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
