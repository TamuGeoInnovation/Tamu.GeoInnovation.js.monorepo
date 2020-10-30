import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

import {
  CheckIn,
  Class,
  CourseCredit,
  Event,
  RsvpType,
  Session,
  Speaker,
  SpeakerInfo,
  Sponsor,
  Tag,
  UserClass,
  UserInfo,
  UserRsvp,
  UserSubmission,
  SubmissionType,
  CheckInModule,
  ClassModule,
  CourseCreditModule,
  EventModule,
  InitialSurveyModule,
  QuestionType,
  RsvpTypeModule,
  SessionModule,
  SignageCategory,
  SignageSubmission,
  SpeakerModule,
  SponsorModule,
  SubmissionTypeModule,
  TagModule,
  UserModule,
  UserClassModule,
  UserInfoModule,
  UserRsvpModule,
  UserSubmissionModule,
  InitialSurveyQuestion,
  InitialSurvey,
  QuestionTypeRepo,
  QuestionTypeModule
} from '@tamu-gisc/gisday/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OIDC_ISSUER } from '../environments/oidc-client-config';
import { localDbConfig, geoidb } from '../environments/ormconfig';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: 'http://localhost:4200'
    }),
    // TypeOrmModule.forRoot({
    //   ...localIdpConfig,
    //   entities: [User, UserRole, Role, TokenEndpointAuthMethod, ClientMetadata, GrantType, RedirectUri, ResponseType]
    // }),
    TypeOrmModule.forRoot({
      ...localDbConfig,
      entities: [
        CheckIn,
        Class,
        CourseCredit,
        Event,
        InitialSurveyQuestion,
        InitialSurvey,
        QuestionType,
        RsvpType,
        Session,
        Speaker,
        SpeakerInfo,
        SubmissionType,
        Sponsor,
        Tag,
        UserClass,
        UserInfo,
        UserRsvp,
        UserSubmission
      ]
    }),
    // TypeOrmModule.forRoot({
    //   ...geoidb,
    //   name: 'geoidb',
    //   entities: [SignageCategory, SignageSubmission]
    // }),
    CheckInModule,
    ClassModule,
    CourseCreditModule,
    EventModule,
    InitialSurveyModule,
    QuestionTypeModule,
    RsvpTypeModule,
    SessionModule,
    SpeakerModule,
    SponsorModule,
    SubmissionTypeModule,
    TagModule,
    UserModule,
    UserClassModule,
    UserInfoModule,
    UserRsvpModule,
    UserSubmissionModule
  ],
  controllers: [AppController],
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
