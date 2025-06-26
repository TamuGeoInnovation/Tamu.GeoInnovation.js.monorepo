import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TierBenefitController } from './tier-benefit.controller';
import { TierBenefitService } from './tier-benefit.service';
import { TierBenefit } from '../../entities/tier-benefit.entity';
import { TierCategory } from '../../entities/tier-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TierBenefit, TierCategory])],
  controllers: [TierBenefitController],
  providers: [TierBenefitService],
  exports: [TierBenefitService]
})
export class TierBenefitModule {}
