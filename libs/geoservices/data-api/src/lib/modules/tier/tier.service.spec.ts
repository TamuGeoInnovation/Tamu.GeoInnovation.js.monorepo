import { Test, TestingModule } from '@nestjs/testing';
import { TierService } from './tier.service';

describe('TierService', () => {
  let service: TierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TierService]
    }).compile();

    service = module.get<TierService>(TierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
