import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatusType } from '@tamu-gisc/covid/common/entities';

import { StatusTypesController } from './status-types.controller';
import { StatusTypesService } from './status-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([StatusType])],
  controllers: [StatusTypesController],
  providers: [StatusTypesService]
})
export class StatusTypesModule {}
