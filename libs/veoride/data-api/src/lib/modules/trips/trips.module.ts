import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { BASE_URL, DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { TasksService } from '../tasks/tasks.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({})
export class TripsModule {
  public static register(path: string, baseUrl: string): DynamicModule {
    return {
      module: TripsModule,
      imports: [TypeOrmModule.forFeature([DataTask])],
      providers: [
        TripsService,
        TasksService,
        { provide: DATASETS_STORE, useValue: path },
        { provide: BASE_URL, useValue: baseUrl }
      ],
      controllers: [TripsController]
    };
  }
}
