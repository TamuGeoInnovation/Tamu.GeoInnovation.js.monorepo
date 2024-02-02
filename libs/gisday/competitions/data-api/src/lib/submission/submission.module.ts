import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason, CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { FormService } from '../form/form.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionSubmission, SubmissionMedia, CompetitionSeason, CompetitionForm, Season])],
  controllers: [SubmissionController],
  providers: [SubmissionService, FormService],
  exports: [SubmissionService]
})
export class SubmissionModule {}
