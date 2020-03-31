import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classification } from '@tamu-gisc/covid/common/entities';

import { SourceTypesService } from './source-types.service';
import { SourceTypesController } from './source-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Classification])],
  providers: [SourceTypesService],
  controllers: [SourceTypesController]
})
export class SourceTypesModule {}
