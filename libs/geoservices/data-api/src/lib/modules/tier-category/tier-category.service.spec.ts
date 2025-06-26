import { Test, TestingModule } from '@nestjs/testing';
import { TierCategoryService } from './tier-category.service';

describe('TierCategoryService', () => {
  let service: TierCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TierCategoryService]
    }).compile();

    service = module.get<TierCategoryService>(TierCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
