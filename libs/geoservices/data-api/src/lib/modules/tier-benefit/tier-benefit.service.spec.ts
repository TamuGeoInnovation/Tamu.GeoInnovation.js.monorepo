import { Test, TestingModule } from '@nestjs/testing';
import { TierBenefitService } from './tier-benefit.service';

describe('TierBenefitService', () => {
  let service: TierBenefitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TierBenefitService]
    }).compile();

    service = module.get<TierBenefitService>(TierBenefitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
