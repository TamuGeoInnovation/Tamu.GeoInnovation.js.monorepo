import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  TestingSitesModule,
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
  StatusType,
  CountyClaim,
  Location,
  LockdownInfo,
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
        TestingSiteInfo,
        TestingSite,
        Lockdown,
        LockdownInfo,
        CountyClaim,
        CountyClaimInfo,
        EntityValue,
        Location
      ]
    }),
    StatesModule,
    CountiesModule,
    UsersModule,
    FieldCategoriesModule,
    FieldTypesModule,
    CategoryValueModule,
    StatusTypesModule,
    TestingSitesModule,
    LockdownsModule,
    StatesModule,
    CountiesModule,
    CountyClaimsModule,
    UsersModule,
    WebsitesModule,
    PhoneNumbersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
