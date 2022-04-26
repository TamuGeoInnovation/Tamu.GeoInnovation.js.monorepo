import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesService } from './field-categories.service';

describe('FieldCategoriesService', () => {
  let fieldCategoriesService: FieldCategoriesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldCategoriesService,
        { provide: getRepositoryToken(FieldCategory), useClass: Repository },
        { provide: getRepositoryToken(FieldType), useClass: Repository },
        { provide: getRepositoryToken(CategoryValue), useClass: Repository }
      ]
    }).compile();

    fieldCategoriesService = module.get<FieldCategoriesService>(FieldCategoriesService);
  });
  describe('Validation ', () => {
    it('service should be defined', () => {
      expect(fieldCategoriesService).toBeDefined();
    });
  });
  describe('getFieldTypesForCategory ', () => {
    it('should return error message with mockParameter being undefined', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
      expect(await fieldCategoriesService.getFieldTypesForCategory(mockParameter)).toMatchObject(expectedResult);
    });
  });
});
