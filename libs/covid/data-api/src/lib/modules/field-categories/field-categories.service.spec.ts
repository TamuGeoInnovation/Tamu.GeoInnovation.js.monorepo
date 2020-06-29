import { Test, TestingModule } from '@nestjs/testing';
import { FieldCategoriesService } from './field-categories.service';

describe('FieldCategoriesService', () => {
  let service: FieldCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldCategoriesService],
    }).compile();

    service = module.get<FieldCategoriesService>(FieldCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
