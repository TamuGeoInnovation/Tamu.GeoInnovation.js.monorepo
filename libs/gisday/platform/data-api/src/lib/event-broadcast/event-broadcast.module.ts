import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventBroadcast, Season, SeasonDay } from '../entities/all.entity';
import { EventBroadcastService } from './event-broadcast.service';
import { EventBroadcastController } from './event-broadcast.controller';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventBroadcast, Season, SeasonDay])],
  providers: [EventBroadcastService, SeasonService],
  controllers: [EventBroadcastController]
})
export class EventBroadcastModule {}
