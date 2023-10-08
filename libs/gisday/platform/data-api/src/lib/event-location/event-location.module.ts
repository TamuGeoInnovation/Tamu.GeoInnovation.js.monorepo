import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLocation } from '../entities/all.entity';
import { EventLocationService } from './event-location.service';
import { EventLocationController } from './event-location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventLocation])],
  controllers: [EventLocationController],
  providers: [EventLocationService]
})
export class EventLocationModule {}
