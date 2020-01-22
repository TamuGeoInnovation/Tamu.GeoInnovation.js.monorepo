import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workshops } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workshops])],
  providers: [WorkshopsService],
  controllers: [WorkshopsController]
})
export class WorkshopsModule {}
