import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { User } from '../../entities/user.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Tier } from '../../entities/tier.entity';
import { TierCategory } from '../../entities/tier-category.entity';
import { TierBenefit } from '../../entities/tier-benefit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Subscription, Tier, TierCategory, TierBenefit])],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
