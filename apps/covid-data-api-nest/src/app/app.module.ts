import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SitesModule,
  LockdownsModule,
  StatesModule,
  CountiesModule,
  WebsitesModule,
  UsersModule,
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
  // Website,
  // WebsiteType,
  // Restriction,
  // RestrictionType,
  // SiteOwner,
  // SiteOwnerType,
  SiteStatus,
  SiteStatusType,
  // SiteService,
  // SiteServiceType,
  // PhoneNumber,
  // PhoneNumberType,
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
  EntityStatus,
  EntityToValue
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
        EntityToValue,
        // Website,
        // SiteOwner,
        TestingSiteInfo,
        TestingSite,
        SiteStatus,
        SiteStatusType,
        // SiteService,
        Lockdown,
        LockdownInfo,
        LockdownStatus,
        // Restriction,
        // PhoneNumber,
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
    SitesModule,
    LockdownsModule,
    StatesModule,
    CountiesModule,
    CountyClaimsModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
