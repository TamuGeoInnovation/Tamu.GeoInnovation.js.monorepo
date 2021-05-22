import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SitesModule,
  DataGroupsModule,
  DataGroupFieldsModule,
  NodeGroupsModule,
  DataModule,
  StatusAPIModule
} from '@tamu-gisc/two/data-api';

import { config } from '../environments/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    SitesModule,
    DataGroupsModule,
    DataGroupFieldsModule,
    NodeGroupsModule,
    DataModule,
    StatusAPIModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
