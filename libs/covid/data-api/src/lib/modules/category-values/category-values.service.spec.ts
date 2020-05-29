import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { CategoryValuesService } from './category-values.service';

describe('CategoryValuesService', () => {
  let service: CategoryValuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService, { provide: getRepositoryToken(CategoryValue), useClass: Repository }]
    }).compile();

    service = module.get<CategoryValuesService>(CategoryValuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
