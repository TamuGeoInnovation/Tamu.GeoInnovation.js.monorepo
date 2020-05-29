import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesService } from './field-categories.service';

describe('FieldCategoriesService', () => {
  let service: FieldCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldCategoriesService,
        { provide: getRepositoryToken(FieldCategory), useClass: Repository },
        { provide: getRepositoryToken(FieldType), useClass: Repository },
        { provide: getRepositoryToken(CategoryValue), useClass: Repository }
      ]
    }).compile();

    service = module.get<FieldCategoriesService>(FieldCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
