import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  GISDAY_ENTITIES,
  CheckInModule,
  ClassModule,
  EventModule,
  InitialSurveyModule,
  RsvpTypeModule,
  SpeakerModule,
  SponsorModule,
  SubmissionTypeModule,
  TagModule,
  UserClassModule,
  UserInfoModule,
  UserRsvpModule,
  UserSubmissionModule,
  QuestionTypeModule,
  UniversityModule,
  SpeakerRoleModule,
  SeasonDayModule,
  SeasonModule,
  OrganizationModule
} from '@tamu-gisc/gisday/platform/data-api';
import { AuthorizationModule } from '@tamu-gisc/common/nest/auth';

import { AppService } from './app.service';
import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [...GISDAY_ENTITIES]
    }),
    AuthorizationModule.forRoot({
      audience: process.env.AUTH0_AUDIENCE,
      issuerUrl: process.env.AUTH0_ISSUER_URL
    }),
    CheckInModule,
    ClassModule,
    EventModule,
    InitialSurveyModule,
    QuestionTypeModule,
    RsvpTypeModule,
    SpeakerModule,
    SpeakerRoleModule,
    SponsorModule,
    SubmissionTypeModule,
    TagModule,
    UniversityModule,
    UserClassModule,
    UserInfoModule,
    UserRsvpModule,
    UserSubmissionModule,
    SeasonDayModule,
    SeasonModule,
    OrganizationModule
  ],
  controllers: [],
  providers: [AppService]
})
export class AppModule {}
