import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeasonDayService } from './season-day.service';
import { SeasonDayController } from './season-day.controller';
import { SeasonDay } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonDay])],
  controllers: [SeasonDayController],
  providers: [SeasonDayService]
})
export class SeasonDayModule {}
