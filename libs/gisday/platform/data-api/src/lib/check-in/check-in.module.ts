import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckInController } from './check-in.controller';
import { CheckInProvider } from './check-in.provider';
import { CheckIn, Event } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Event])],
  controllers: [CheckInController],
  providers: [CheckInProvider]
})
export class CheckInModule {}
