import { Test, TestingModule } from '@nestjs/testing';

import { CategoryValuesService } from './category-values.service';
import { CategoryValuesController } from './category-values.controller';

jest.mock('./category-values.service');

describe('CategoryValues Controller', () => {
  let controller: CategoryValuesController;
  let service: CategoryValuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService],
      controllers: [CategoryValuesController]
    }).compile();
    service = module.get<CategoryValuesService>(CategoryValuesService);
    controller = module.get<CategoryValuesController>(CategoryValuesController);
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
