import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';

import { FormController } from './form.controller';
import { FormService } from './form.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSeason, CompetitionForm])],
  controllers: [FormController],
  providers: [FormService]
})
export class FormModule {}
