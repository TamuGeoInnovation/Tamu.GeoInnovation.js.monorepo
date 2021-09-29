import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { TasksService } from '../tasks/tasks.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataTask])],
  providers: [TripsService, TasksService],
  controllers: [TripsController]
})
export class TripsModule {}
