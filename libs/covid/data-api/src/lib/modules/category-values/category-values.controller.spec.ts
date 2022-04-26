import { Test, TestingModule } from '@nestjs/testing';

import { CategoryValuesService } from './category-values.service';
import { CategoryValuesController } from './category-values.controller';

jest.mock('./category-values.service');

describe('CategoryValues Controller', () => {
  let categoryValuesService: CategoryValuesService;
  let categoryValuesController: CategoryValuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService],
      controllers: [CategoryValuesController]
    }).compile();
    categoryValuesService = module.get<CategoryValuesService>(CategoryValuesService);
    categoryValuesController = module.get<CategoryValuesController>(CategoryValuesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(categoryValuesController).toBeDefined();
    });

    it('service should be defined', () => {
      expect(categoryValuesService).toBeDefined();
    });
  });
});
