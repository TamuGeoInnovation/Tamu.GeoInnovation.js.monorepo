import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLocation, Season, SeasonDay } from '../entities/all.entity';
import { EventLocationService } from './event-location.service';
import { EventLocationController } from './event-location.controller';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventLocation, Season, SeasonDay])],
  controllers: [EventLocationController],
  providers: [EventLocationService, SeasonService]
})
export class EventLocationModule {}
