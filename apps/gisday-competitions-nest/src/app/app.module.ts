import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

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
  imports: [
    TypeOrmModule.forRoot({ ...dbConfig, entities }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379
      }
    }),
    GisdayCompetitionsDataApiModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
