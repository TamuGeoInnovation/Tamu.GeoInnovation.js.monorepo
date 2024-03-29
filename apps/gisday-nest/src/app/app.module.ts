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
  OrganizationModule,
  EventBroadcastModule,
  EventLocationModule,
  PlaceModule,
  AssetsModule,
  ContactModule
} from '@tamu-gisc/gisday/platform/data-api';
import { AuthorizationModule } from '@tamu-gisc/common/nest/auth';

import { AppService } from './app.service';
import { environment, ormConfig } from '../environments/environment';
import { GISDAY_COMPETITIONS_ENTITIES, GisdayCompetitionsDataApiModule } from '@tamu-gisc/gisday/competitions/data-api';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: ormConfig.type as any,
      host: ormConfig.host,
      username: ormConfig.username,
      password: ormConfig.password,
      database: ormConfig.database,
      synchronize: ormConfig.synchronize,
      dropSchema: ormConfig.dropSchema,
      logging: ormConfig.logging,
      extra: ormConfig.extra,
      entities: [...GISDAY_ENTITIES, ...GISDAY_COMPETITIONS_ENTITIES]
    }),
    AuthorizationModule.forRoot({
      jwt: {
        audience: environment.auth0_audience,
        issuerUrl: environment.auth0_issuerUrl
      },
      management: {
        domain: environment.auth0_management_domain,
        clientId: environment.auth0_management_clientId,
        clientSecret: environment.auth0_management_clientSecret
      }
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
    OrganizationModule,
    EventBroadcastModule,
    EventLocationModule,
    PlaceModule,
    AssetsModule,
    ContactModule,
    GisdayCompetitionsDataApiModule
  ],
  controllers: [],
  providers: [AppService]
})
export class AppModule {}
