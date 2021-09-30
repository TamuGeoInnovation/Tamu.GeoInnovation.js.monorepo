import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { DATASETS_STORE } from '../../interfaces/module-registration.interface';
import { TasksService } from '../tasks/tasks.service';
import { StatusChangesService } from './status-changes.service';
import { StatusChangesController } from './status-changes.controller';

@Module({})
export class StatusChangesModule {
  public static register(path: string): DynamicModule {
    return {
      module: StatusChangesModule,
      imports: [TypeOrmModule.forFeature([DataTask])],
      providers: [StatusChangesService, TasksService, { provide: DATASETS_STORE, useValue: path }],
      controllers: [StatusChangesController]
    };
  }
}
