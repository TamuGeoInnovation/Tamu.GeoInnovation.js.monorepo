import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  SubmissionLocation,
  SubmissionMedia
} from '../entities/all.entities';

import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

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
  controllers: [SeasonController],
  providers: [SeasonService],
  exports: [SeasonService]
})
export class SeasonModule {}
