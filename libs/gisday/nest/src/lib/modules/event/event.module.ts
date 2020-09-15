import { Module } from '@nestjs/common';
import { EventController } from '../../controllers/event/event.controller';
import { EventProvider } from '../../providers/event/event.provider';

@Module({
  imports: [],
  controllers: [EventController],
  providers: [EventProvider],
  exports: []
})
export class EventModule {}
