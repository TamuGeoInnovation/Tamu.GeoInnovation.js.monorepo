import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';
import { FormController } from './form.controller';
import { FormService } from './form.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSeason, CompetitionForm, Season])],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService]
})
export class FormModule {}
