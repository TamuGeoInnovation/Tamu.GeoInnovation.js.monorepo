import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Event,
  Sponsor,
  Tag,
  UserRsvp,
  EventBroadcast,
  EventLocation,
  Speaker,
  Season,
  SeasonDay
} from '../entities/all.entity';
import { EventController } from '../event/event.controller';
import { EventProvider } from './event.provider';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Sponsor, Tag, UserRsvp, EventBroadcast, EventLocation, Speaker, Season, SeasonDay])
  ],
  controllers: [EventController],
  providers: [EventProvider, SeasonService],
  exports: [EventProvider]
})
export class EventModule {}
