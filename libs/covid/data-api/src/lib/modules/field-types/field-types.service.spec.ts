import { Test, TestingModule } from '@nestjs/testing';
import { FieldTypesService } from './field-types.service';

describe('FieldTypesService', () => {
  let service: FieldTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypesService],
    }).compile();

    service = module.get<FieldTypesService>(FieldTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
