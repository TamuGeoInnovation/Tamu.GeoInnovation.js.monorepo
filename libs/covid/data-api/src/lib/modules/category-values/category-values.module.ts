import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { CategoryValuesService } from './category-values.service';
import { CategoryValuesController } from './category-values.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryValue])],
  providers: [CategoryValuesService],
  controllers: [CategoryValuesController]
})
export class CategoryValueModule {}
