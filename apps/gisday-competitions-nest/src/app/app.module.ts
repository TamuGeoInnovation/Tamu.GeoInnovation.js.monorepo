import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '@tamu-gisc/gisday/common';
import { GisdayCompetitionsModule } from '@tamu-gisc/gisday/competitions';

import { config } from '../environments/ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const entities = [CompetitionSubmission, SubmissionLocation, SubmissionMedia];

@Module({
  imports: [TypeOrmModule.forRoot({ ...config, entities }), GisdayCompetitionsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
