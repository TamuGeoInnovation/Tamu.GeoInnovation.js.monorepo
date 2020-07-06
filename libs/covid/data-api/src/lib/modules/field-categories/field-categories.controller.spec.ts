import { Test, TestingModule } from '@nestjs/testing';

import { FieldCategory } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesController } from './field-categories.controller';
import { FieldCategoriesService } from './field-categories.service';

jest.mock('./field-categories.service');

describe('FieldCategories Controller', () => {
  let service: FieldCategoriesService;
  let controller: FieldCategoriesController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [FieldCategoriesService],
      controllers: [FieldCategoriesController]
    }).compile();
    service = module.get<FieldCategoriesService>(FieldCategoriesService);
    controller = module.get<FieldCategoriesController>(FieldCategoriesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  const mockParameters = 'foobar';

  describe('getFieldTypesForCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(service, 'getFieldTypesForCategory').mockResolvedValue(expectedResult);
      expect(await controller.getFieldTypesForCategory(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('addFieldTypeToCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(service, 'addFieldTypeToCategory').mockResolvedValue(expectedResult);
      expect(await controller.addFieldTypeToCategory(mockParameters, mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('getCategoryValues', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [new FieldCategory()];
      jest.spyOn(service, 'getCategoryWithValues').mockResolvedValue(expectedResult);
      expect(await controller.getCategoryValues(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('addValueToType', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new FieldCategory();
      jest.spyOn(service, 'addValueToCategory').mockResolvedValue(expectedResult);
      expect(await controller.addValueToType(mockParameters, mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getCategories', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [new FieldCategory()];
      jest.spyOn(service, 'getAllCategoriesWithTypes').mockResolvedValue(expectedResult);
      expect(await controller.getCategories()).toMatchObject(expectedResult);
    });
  });

  describe('deleteCategory', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented'
      };
      expect(await controller.deleteCategory()).toMatchObject(expectedResult);
    });
  });
});
