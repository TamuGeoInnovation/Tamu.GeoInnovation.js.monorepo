import { Test, TestingModule } from '@nestjs/testing';
import { SourceTypesService } from './source-types.service';

describe('SourceTypesService', () => {
  let service: SourceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceTypesService],
    }).compile();

    service = module.get<SourceTypesService>(SourceTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
