import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

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
  SiteCopyModule,
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
import { GisdayFeature, gisdaySite, siteHas } from '@tamu-gisc/gisday/common';

/**
 * The site this API serves (#1835), from `GISDAY_SITE`; unset, it is txgisday.org. A feature the site
 * leaves out has no endpoints, so its data can't be written by calling the API directly. Its tables
 * stay, so every site's database has the same schema and the same migrations.
 */
const site = gisdaySite(process.env.GISDAY_SITE);
const onlyWith = <T>(feature: GisdayFeature, modules: Array<T>): Array<T> => (siteHas(site, feature) ? modules : []);

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
        clientSecret: environment.auth0_management_clientSecret,
        // Set only in environment.ts, the local build's (#1759); undefined in the dev and production
        // builds, which therefore stop at startup without the three values above.
        disabled: environment.auth0_management_disabled
      }
    }),
    ...onlyWith('checkIns', [CheckInModule]),
    ...onlyWith('classes', [ClassModule, UserClassModule]),
    ...onlyWith('competitions', [UserSubmissionModule, GisdayCompetitionsDataApiModule]),
    EventModule,
    InitialSurveyModule,
    QuestionTypeModule,
    RsvpTypeModule,
    SpeakerModule,
    SpeakerRoleModule,
    SponsorModule,
    SubmissionTypeModule,
    TagModule,
    SiteCopyModule,
    UniversityModule,
    UserInfoModule,
    UserRsvpModule,
    SeasonDayModule,
    SeasonModule,
    OrganizationModule,
    EventBroadcastModule,
    EventLocationModule,
    PlaceModule,
    AssetsModule,
    ContactModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379
      }
    })
  ],
  controllers: [],
  providers: [AppService]
})
export class AppModule {}
