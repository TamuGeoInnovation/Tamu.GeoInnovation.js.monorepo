import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { CategoryValuesService } from './category-values.service';
import { CategoryValuesController } from './category-values.controller';

describe('CategoryValues Controller', () => {
  let controller: CategoryValuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService, { provide: getRepositoryToken(CategoryValue), useClass: Repository }],
      controllers: [CategoryValuesController]
    }).compile();

    controller = module.get<CategoryValuesController>(CategoryValuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
