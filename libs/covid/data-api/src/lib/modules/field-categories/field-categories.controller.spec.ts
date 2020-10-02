import { Test, TestingModule } from '@nestjs/testing';

import { FieldCategory } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesController } from './field-categories.controller';
import { FieldCategoriesService } from './field-categories.service';

jest.mock('./field-categories.service');

describe('FieldCategories Controller', () => {
  let fieldCategoriesService: FieldCategoriesService;
  let fieldCategoriesController: FieldCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldCategoriesService],
      controllers: [FieldCategoriesController]
    }).compile();
    fieldCategoriesService = module.get<FieldCategoriesService>(FieldCategoriesService);
    fieldCategoriesController = module.get<FieldCategoriesController>(FieldCategoriesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(fieldCategoriesController).toBeDefined();
    });
  });

  const mockParameters = 'foobar';

  describe('getFieldTypesForCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(fieldCategoriesService, 'getFieldTypesForCategory').mockResolvedValue(expectedResult);
      expect(await fieldCategoriesController.getFieldTypesForCategory(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('addFieldTypeToCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(fieldCategoriesService, 'addFieldTypeToCategory').mockResolvedValue(expectedResult);
      expect(await fieldCategoriesController.addFieldTypeToCategory(mockParameters, mockParameters)).toMatchObject(
        expectedResult
      );
    });
  });

  describe('getCategoryValues', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [new FieldCategory()];
      jest.spyOn(fieldCategoriesService, 'getCategoryWithValues').mockResolvedValue(expectedResult);
      expect(await fieldCategoriesController.getCategoryValues(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('addValueToType', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(fieldCategoriesService, 'addValueToCategory').mockResolvedValue(expectedResult);
      expect(await fieldCategoriesController.addValueToType(mockParameters, mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getCategories', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [new FieldCategory()];
      jest.spyOn(fieldCategoriesService, 'getAllCategoriesWithTypes').mockResolvedValue(expectedResult);
      expect(await fieldCategoriesController.getCategories()).toMatchObject(expectedResult);
    });
  });

  describe('deleteCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented'
      };
      expect(await fieldCategoriesController.deleteCategory()).toMatchObject(expectedResult);
    });
  });
});
