import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SitesModule,
  LockdownsModule,
  StatesModule,
  CountiesModule,
  WebsiteTypesModule,
  WebsitesModule,
  RestrictionsModule,
  SiteServicesModule,
  SiteOwnersModule,
  SiteStatusesModule,
  UsersModule,
  PhoneNumberTypesModule,
  PhoneNumbersModule
} from '@tamu-gisc/covid/data-api';

import {
  TestingSiteInfo,
  TestingSite,
  Lockdown,
  County,
  State,
  User,
  Website,
  WebsiteType,
  Restriction,
  RestrictionType,
  SiteOwner,
  SiteOwnerType,
  SiteStatus,
  SiteStatusType,
  SiteService,
  SiteServiceType,
  PhoneNumber,
  PhoneNumberType,
  CountyClaim,
  Location,
  LockdownInfo,
  LockdownStatus,
  CountyClaimInfo,
  CountyClaimStatus
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
        Website,
        WebsiteType,
        SiteOwnerType,
        SiteOwner,
        TestingSiteInfo,
        TestingSite,
        SiteStatusType,
        SiteStatus,
        SiteServiceType,
        SiteService,
        Lockdown,
        State,
        County,
        RestrictionType,
        Restriction,
        PhoneNumber,
        PhoneNumberType,
        CountyClaim,
        CountyClaimInfo,
        CountyClaimStatus,
        Location,
        LockdownInfo,
        LockdownStatus
      ]
    }),
    SitesModule,
    SiteServicesModule,
    SiteOwnersModule,
    SiteStatusesModule,
    LockdownsModule,
    StatesModule,
    CountiesModule,
    WebsiteTypesModule,
    WebsitesModule,
    RestrictionsModule,
    UsersModule,
    PhoneNumberTypesModule,
    PhoneNumbersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
