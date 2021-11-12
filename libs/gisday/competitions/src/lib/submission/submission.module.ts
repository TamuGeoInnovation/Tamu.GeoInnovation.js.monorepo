import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  SubmissionLocation,
  SubmissionMedia
} from '@tamu-gisc/gisday/common';

import { FormService } from '../form/form.service';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetitionSubmission,
      SubmissionLocation,
      SubmissionMedia,
      CompetitionSeason,
      CompetitionForm
    ])
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, FormService]
})
export class SubmissionModule {}
