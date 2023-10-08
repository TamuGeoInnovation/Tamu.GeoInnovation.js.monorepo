import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventBroadcast } from '../entities/all.entity';
import { EventBroadcastService } from './event-broadcast.service';
import { EventBroadcastController } from './event-broadcast.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventBroadcast])],
  providers: [EventBroadcastService],
  controllers: [EventBroadcastController]
})
export class EventBroadcastModule {}
