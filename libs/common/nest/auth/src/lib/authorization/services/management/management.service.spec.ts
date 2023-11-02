import { Test, TestingModule } from '@nestjs/testing';
import { ManagementService } from './management.service';

describe('ManagementService', () => {
  let service: ManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagementService]
    }).compile();

    service = module.get<ManagementService>(ManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
