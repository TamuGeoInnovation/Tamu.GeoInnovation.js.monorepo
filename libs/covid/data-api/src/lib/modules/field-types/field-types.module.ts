import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldType } from '@tamu-gisc/covid/common/entities';

import { FieldTypesService } from './field-types.service';
import { FieldTypesController } from './field-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FieldType])],
  providers: [FieldTypesService],
  controllers: [FieldTypesController]
})
export class FieldTypesModule {}
