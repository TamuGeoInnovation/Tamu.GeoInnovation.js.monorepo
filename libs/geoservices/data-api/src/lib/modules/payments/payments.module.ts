import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { User } from '../../entities/user.entity';
import { Subscription } from '../../entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Subscription])],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
