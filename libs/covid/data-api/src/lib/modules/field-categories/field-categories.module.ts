import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { FieldCategoriesService } from './field-categories.service';
import { FieldCategoriesController } from './field-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FieldCategory, FieldType, CategoryValue])],
  providers: [FieldCategoriesService],
  controllers: [FieldCategoriesController]
})
export class FieldCategoriesModule {}
