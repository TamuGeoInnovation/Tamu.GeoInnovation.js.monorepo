import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

import {
  CheckIn,
  Class,
  CourseCredit,
  Event,
  RsvpType,
  Speaker,
  SpeakerInfo,
  Sponsor,
  Tag,
  UserClass,
  UserInfo,
  UserRsvp,
  UserSubmission,
  SubmissionType,
  University,
  CheckInModule,
  ClassModule,
  EventModule,
  InitialSurveyModule,
  QuestionType,
  RsvpTypeModule,
  SpeakerModule,
  SponsorModule,
  SubmissionTypeModule,
  TagModule,
  UserController,
  UserClassModule,
  UserInfoModule,
  UserRsvpModule,
  UserSubmissionModule,
  InitialSurveyQuestion,
  InitialSurveyResponse,
  QuestionTypeModule,
  UniversityModule,
  SpeakerRole,
  SpeakerRoleModule
} from '@tamu-gisc/gisday/platform/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { localDbConfig } from '../environments/ormconfig';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: 'http://localhost:4200'
    }),
    TypeOrmModule.forRoot({
      ...localDbConfig,
      entities: [
        CheckIn,
        Class,
        CourseCredit,
        Event,
        InitialSurveyQuestion,
        InitialSurveyResponse,
        QuestionType,
        RsvpType,
        // Session,
        Speaker,
        SpeakerInfo,
        SpeakerRole,
        SubmissionType,
        Sponsor,
        Tag,
        UserClass,
        UserInfo,
        UserRsvp,
        UserSubmission,
        University
      ]
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
    UserSubmissionModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClaimsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientController);
  }
}
