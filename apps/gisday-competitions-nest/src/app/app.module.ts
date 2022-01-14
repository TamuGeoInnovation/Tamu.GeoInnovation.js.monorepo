import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  GisdayCompetitionsDataApiModule,
  CompetitionSubmission,
  SubmissionLocation,
  SubmissionMedia,
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmissionValidationStatus
} from '@tamu-gisc/gisday/competitions/data-api';

import { dbConfig } from '../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const entities = [
  CompetitionSubmission,
  CompetitionSubmissionValidationStatus,
  SubmissionLocation,
  SubmissionMedia,
  CompetitionForm,
  CompetitionSeason
];

@Module({
  imports: [TypeOrmModule.forRoot({ ...dbConfig, entities }), GisdayCompetitionsDataApiModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
