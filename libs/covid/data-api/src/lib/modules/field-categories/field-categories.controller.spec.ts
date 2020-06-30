import { Test, TestingModule } from '@nestjs/testing';

import { FieldCategoriesController } from './field-categories.controller';
import { FieldCategoriesService } from './field-categories.service';
import { FieldCategory } from '@tamu-gisc/covid/common/entities';

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

  describe('getFieldTypesForCategory', () => {
    it('should return expected Result', async () => {
      const expectedValue = new FieldCategory();
      jest.spyOn(service, 'getFieldTypesForCategory').mockResolvedValue(expectedValue);
      expect(await controller.getFieldTypesForCategory('foo')).toMatchObject(expectedValue);
    });
  });

  describe('addFieldTypeToCategory', () => {
    it('should return expected Result', async () => {
      const expectedValue = new FieldCategory();
      jest.spyOn(service, 'addFieldTypeToCategory').mockResolvedValue(expectedValue);
      expect(await controller.addFieldTypeToCategory('foo', 'bar')).toMatchObject(expectedValue);
    });
  });

  describe('getCategoryValues', () => {
    it('should return expected Result', async () => {
      const expectedValue = [new FieldCategory()];
      jest.spyOn(service, 'getCategoryWithValues').mockResolvedValue(expectedValue);
      expect(await controller.getCategoryValues('foo')).toMatchObject(expectedValue);
    });
  });

  describe('addValueToType', () => {
    it('should return expected Result', async () => {
      const expectedValue = new FieldCategory();
      jest.spyOn(service, 'addValueToCategory').mockResolvedValue(expectedValue);
      expect(await controller.addValueToType('foo', 'bar')).toMatchObject(expectedValue);
    });
  });
  describe('getCategories', () => {
    it('should return expected Result', async () => {
      const expectedValue = [new FieldCategory()];
      jest.spyOn(service, 'getAllCategoriesWithTypes').mockResolvedValue(expectedValue);
      expect(await controller.getCategories()).toMatchObject(expectedValue);
    });
  });

  describe('deleteCategory', () => {
    it('should return expected Result', async () => {
      const expectedValue = {
        status: 501,
        success: false,
        message: 'Not implemented'
      };

      expect(await controller.deleteCategory()).toMatchObject(expectedValue);
    });
  });
});
