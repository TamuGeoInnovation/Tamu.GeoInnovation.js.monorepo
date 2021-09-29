import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { TasksService } from '../tasks/tasks.service';
import { StatusChangesService } from './status-changes.service';
import { StatusChangesController } from './status-changes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataTask])],
  providers: [StatusChangesService, TasksService],
  controllers: [StatusChangesController]
})
export class StatusChangesModule {}
