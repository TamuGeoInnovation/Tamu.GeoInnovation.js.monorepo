import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  EventRepo,
  SponsorRepo,
  TagRepo,
  UserRsvpRepo,
  EventBroadcastRepo,
  EventLocationRepo
} from '../../entities/all.entity';
import { EventController } from '../../controllers/event/event.controller';
import { EventProvider } from '../../providers/event/event.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRepo, EventLocationRepo, EventBroadcastRepo, TagRepo, SponsorRepo, UserRsvpRepo])
  ],
  controllers: [EventController],
  providers: [EventProvider],
  exports: [EventProvider]
})
export class EventModule {}
