import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TierCategoryController } from './tier-category.controller';
import { TierCategoryService } from './tier-category.service';
import { TierCategory } from '../../entities/tier-category.entity';
import { Tier } from '../../entities/tier.entity';
import { TierBenefit } from '../../entities/tier-benefit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TierCategory, Tier, TierBenefit])],
  controllers: [TierCategoryController],
  providers: [TierCategoryService],
  exports: [TierCategoryService]
})
export class TierCategoryModule {}
