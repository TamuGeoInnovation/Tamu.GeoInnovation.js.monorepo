import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/common';

import { FormController } from './form.controller';
import { FormService } from './form.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSeason, CompetitionForm])],
  controllers: [FormController],
  providers: [FormService]
})
export class FormModule {}
