import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event, Sponsor, Tag, UserRsvp, EventBroadcast, EventLocation, Speaker } from '../entities/all.entity';
import { EventController } from '../event/event.controller';
import { EventProvider } from './event.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Sponsor, Tag, UserRsvp, EventBroadcast, EventLocation, Speaker])],
  controllers: [EventController],
  providers: [EventProvider],
  exports: [EventProvider]
})
export class EventModule {}
