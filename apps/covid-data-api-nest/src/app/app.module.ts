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
  UsersModule,
  PhoneNumberTypesModule,
  PhoneNumbersModule
} from '@tamu-gisc/covid/data-api';

import {
  TestingSite,
  Lockdown,
  County,
  State,
  User,
  Source,
  SourceType,
  Restriction,
  SiteOwner,
  SiteStatus,
  SiteService,
  PhoneNumber,
  PhoneNumberType
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
        SourceType,
        SiteOwner,
        TestingSite,
        SiteStatus,
        SiteService,
        Lockdown,
        State,
        County,
        Restriction,
        PhoneNumber,
        PhoneNumberType
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
    UsersModule,
    PhoneNumberTypesModule,
    PhoneNumbersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
