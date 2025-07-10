import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { Tier } from '../../entities/tier.entity';
import { TierCategory } from '../../entities/tier-category.entity';
import { TierBenefit } from '../../entities/tier-benefit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tier, TierCategory, TierBenefit])],
  controllers: [TierController],
  providers: [TierService],
  exports: [TierService]
})
export class TierModule {}
