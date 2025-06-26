import { Test, TestingModule } from '@nestjs/testing';
import { TierBenefitController } from './tier-benefit.controller';
import { TierBenefitService } from './tier-benefit.service';

describe('TierBenefitController', () => {
  let controller: TierBenefitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TierBenefitController],
      providers: [TierBenefitService]
    }).compile();

    controller = module.get<TierBenefitController>(TierBenefitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
