import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  GISDAY_ENTITIES,
  GISDAY_SUBSCRIBERS,
  CheckInModule,
  ClassModule,
  EventModule,
  RsvpTypeModule,
  SpeakerModule,
  SpeakerEditModule,
  JudgingModule,
  SeasonWinnerModule,
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
  ContactModule,
  PrivateFieldsInterceptor
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
      entities: [...GISDAY_ENTITIES, ...GISDAY_COMPETITIONS_ENTITIES],
      // Stamps `updated` with the real time, not getdate() (#2926).
      subscribers: GISDAY_SUBSCRIBERS
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
    // Judging the research competitions (#3183) is part of them, and so are their winners (#3239).
    ...onlyWith('competitions', [UserSubmissionModule, GisdayCompetitionsDataApiModule, JudgingModule, SeasonWinnerModule]),
    EventModule,
    QuestionTypeModule,
    RsvpTypeModule,
    SpeakerModule,
    SpeakerEditModule,
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
    ContactModule
  ],
  controllers: [],
  providers: [
    AppService,
    // Removes contact details and speakers' emails from every response unless the caller may manage them.
    { provide: APP_INTERCEPTOR, useClass: PrivateFieldsInterceptor }
  ]
})
export class AppModule {}
