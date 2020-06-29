import { Test, TestingModule } from '@nestjs/testing';
import { CategoryValuesService } from './category-values.service';

describe('CategoryValuesService', () => {
  let service: CategoryValuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryValuesService]
    }).compile();

    service = module.get<CategoryValuesService>(CategoryValuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
