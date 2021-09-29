import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask } from '@tamu-gisc/veoride/common/entities';

import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataTask])],
  providers: [TasksService]
})
export class TasksModule {}
