import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

import {
  CheckIn,
  Class,
  CourseCredit,
  Event,
  EventBroadcast,
  EventLocation,
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

import { AppService } from './app.service';
import { localDbConfig } from '../environments/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...localDbConfig,
      entities: [
        CheckIn,
        Class,
        CourseCredit,
        Event,
        EventBroadcast,
        EventLocation,
        InitialSurveyQuestion,
        InitialSurveyResponse,
        QuestionType,
        RsvpType,
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
  controllers: [UserController],
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
