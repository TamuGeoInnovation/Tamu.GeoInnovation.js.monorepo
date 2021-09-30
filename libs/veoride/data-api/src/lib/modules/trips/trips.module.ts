import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { TasksService } from '../tasks/tasks.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({})
export class TripsModule {
  public static register(path: string): DynamicModule {
    return {
      module: TripsModule,
      imports: [TypeOrmModule.forFeature([DataTask])],
      providers: [TripsService, TasksService, { provide: DATASETS_STORE, useValue: path }],
      controllers: [TripsController]
    };
  }
}
