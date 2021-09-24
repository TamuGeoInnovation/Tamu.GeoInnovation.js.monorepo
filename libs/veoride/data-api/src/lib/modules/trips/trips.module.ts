import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TripsService],
  controllers: [TripsController]
})
export class TripsModule {}
