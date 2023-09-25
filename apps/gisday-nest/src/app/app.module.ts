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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: process.env.TYPEORM_CONNECTION as any,
      host: process.env.TYPEORM_HOST,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' ? true : false,
      dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true' ? true : false,
      logging: process.env.TYPEORM_LOGGING === 'true' ? true : false,
      extra: process.env.TYPEORM_EXTRA,
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
