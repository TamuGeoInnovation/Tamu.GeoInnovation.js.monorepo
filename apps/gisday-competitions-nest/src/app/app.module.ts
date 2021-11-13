import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CompetitionSubmission,
  SubmissionLocation,
  SubmissionMedia,
  CompetitionForm,
  CompetitionSeason
} from '@tamu-gisc/gisday/common';
import { GisdayCompetitionsModule } from '@tamu-gisc/gisday/competitions';

import { dbConfig } from '../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const entities = [CompetitionSubmission, SubmissionLocation, SubmissionMedia, CompetitionForm, CompetitionSeason];

@Module({
  imports: [TypeOrmModule.forRoot({ ...dbConfig, entities }), GisdayCompetitionsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
