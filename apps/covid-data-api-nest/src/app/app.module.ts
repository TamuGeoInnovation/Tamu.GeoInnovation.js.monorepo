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
  PhoneNumbersModule,
  FieldCategoriesModule,
  FieldTypesModule,
  CategoryValueModule,
  StatusTypesModule,
  CountyClaimsModule
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
  StatusType,
  CountyClaim,
  Location,
  LockdownInfo,
  LockdownStatus,
  CountyClaimInfo,
  FieldCategory,
  FieldType,
  CategoryValue,
  EntityValue,
  EntityStatus
} from '@tamu-gisc/covid/common/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        State,
        County,
        User,
        FieldCategory,
        CategoryValue,
        FieldType,
        StatusType,
        EntityStatus,
        // Website,
        // WebsiteType,
        // SiteOwnerType,
        // SiteOwner,
        // TestingSiteInfo,
        // TestingSite,
        // SiteStatusType,
        // SiteStatus,
        // SiteServiceType,
        // SiteService,
        // Lockdown,
        // LockdownInfo,
        // LockdownStatus,
        // RestrictionType,
        // Restriction,
        // PhoneNumber,
        // PhoneNumberType,
        CountyClaim,
        CountyClaimInfo,
        EntityValue,
        // CountyClaimStatus,
        Location
      ]
    }),
    FieldCategoriesModule,
    FieldTypesModule,
    CategoryValueModule,
    StatusTypesModule,
    // SitesModule,
    // SiteServicesModule,
    // SiteOwnersModule,
    // SiteStatusesModule,
    // LockdownsModule,
    StatesModule,
    CountiesModule,
    CountyClaimsModule,
    // WebsiteTypesModule,
    // WebsitesModule,
    // RestrictionsModule,
    UsersModule
    // PhoneNumberTypesModule,
    // PhoneNumbersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
