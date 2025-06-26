import { Test, TestingModule } from '@nestjs/testing';
import { TierCategoryController } from './tier-category.controller';
import { TierCategoryService } from './tier-category.service';

describe('TierCategoryController', () => {
  let controller: TierCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TierCategoryController],
      providers: [TierCategoryService]
    }).compile();

    controller = module.get<TierCategoryController>(TierCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
