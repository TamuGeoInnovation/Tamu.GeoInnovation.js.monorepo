import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SitesModule,
  LockdownsModule,
  StatesModule,
  CountiesModule,
  SourceTypesModule,
  RestrictionsModule,
  SiteServicesModule,
  SiteOwnersModule,
  SiteStatusesModule,
  UsersModule
} from '@tamu-gisc/covid/data-api';

import {
  TestingSite,
  Lockdown,
  County,
  State,
  User,
  Source,
  Classification,
  Restriction,
  SiteOwner,
  SiteStatus,
  SiteService
} from '@tamu-gisc/covid/common/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        User,
        Source,
        Classification,
        SiteOwner,
        TestingSite,
        SiteStatus,
        SiteService,
        Lockdown,
        State,
        County,
        Restriction
      ]
    }),
    SitesModule,
    SiteServicesModule,
    SiteOwnersModule,
    SiteStatusesModule,
    LockdownsModule,
    StatesModule,
    CountiesModule,
    SourceTypesModule,
    RestrictionsModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
