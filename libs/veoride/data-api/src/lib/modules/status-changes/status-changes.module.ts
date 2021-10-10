import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { BASE_URL, DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { TasksService } from '../tasks/tasks.service';
import { StatusChangesService } from './status-changes.service';
import { StatusChangesController } from './status-changes.controller';

@Module({})
export class StatusChangesModule {
  public static register(path: string, baseUrl: string): DynamicModule {
    return {
      module: StatusChangesModule,
      imports: [TypeOrmModule.forFeature([DataTask])],
      providers: [
        StatusChangesService,
        TasksService,
        { provide: DATASETS_STORE, useValue: path },
        { provide: BASE_URL, useValue: baseUrl }
      ],
      controllers: [StatusChangesController]
    };
  }
}
