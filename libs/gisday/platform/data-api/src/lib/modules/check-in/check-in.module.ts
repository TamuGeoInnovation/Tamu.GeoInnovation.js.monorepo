import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckInController } from '../../controllers/check-in/check-in.controller';
import { CheckInProvider } from '../../providers/check-in/check-in.provider';
import { CheckInRepo, EventRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInRepo, EventRepo])],
  controllers: [CheckInController],
  providers: [CheckInProvider]
})
export class CheckInModule {}
