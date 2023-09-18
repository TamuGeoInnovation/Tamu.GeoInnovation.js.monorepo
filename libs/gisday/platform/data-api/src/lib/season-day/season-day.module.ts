import { Module } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';
import { SeasonDayController } from './season-day.controller';

@Module({
  controllers: [SeasonDayController],
  providers: [SeasonDayService]
})
export class SeasonDayModule {}
