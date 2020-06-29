import { Test, TestingModule } from '@nestjs/testing';
import { StatusTypesService } from './status-types.service';

describe('StatusTypesService', () => {
  let service: StatusTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusTypesService],
    }).compile();

    service = module.get<StatusTypesService>(StatusTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
