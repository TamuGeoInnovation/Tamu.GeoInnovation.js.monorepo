import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';

@Module({
  providers: [TripsService],
  controllers: [TripsController]
})
export class TripsModule {}
