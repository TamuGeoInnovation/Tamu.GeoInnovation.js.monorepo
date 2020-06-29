import { Test, TestingModule } from '@nestjs/testing';
import { FieldCategoriesController } from './field-categories.controller';

describe('FieldCategories Controller', () => {
  let controller: FieldCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldCategoriesController],
    }).compile();

    controller = module.get<FieldCategoriesController>(FieldCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
