import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventRepo, TagRepo } from '../../entities/all.entity';
import { EventController } from '../../controllers/event/event.controller';
import { EventProvider } from '../../providers/event/event.provider';

@Module({
  imports: [TypeOrmModule.forFeature([EventRepo, TagRepo])],
  controllers: [EventController],
  providers: [EventProvider],
  exports: [EventProvider]
})
export class EventModule {}
