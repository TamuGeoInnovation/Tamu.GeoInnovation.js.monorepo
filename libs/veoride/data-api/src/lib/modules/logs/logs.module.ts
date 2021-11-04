import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Log } from '@tamu-gisc/veoride/common/entities';

import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogsService],
  controllers: [LogsController]
})
export class LogsModule {}
