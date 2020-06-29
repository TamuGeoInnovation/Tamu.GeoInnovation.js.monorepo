import { Test, TestingModule } from '@nestjs/testing';
import { CategoryValuesController } from './category-values.controller';

describe('CategoryValues Controller', () => {
  let controller: CategoryValuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryValuesController],
    }).compile();

    controller = module.get<CategoryValuesController>(CategoryValuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
