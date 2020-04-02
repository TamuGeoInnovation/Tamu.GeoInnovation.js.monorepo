import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SourceType } from '@tamu-gisc/covid/common/entities';

import { SourceTypesService } from './source-types.service';
import { SourceTypesController } from './source-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SourceType])],
  providers: [SourceTypesService],
  controllers: [SourceTypesController]
})
export class SourceTypesModule {}
