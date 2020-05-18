import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config } from '../environments/ormconfig';

import { SitesModule, DataGroupsModule, DataGroupFieldsModule, NodeGroupsModule, DataModule, StatusModule } from '@tamu-gisc/two/data-api';
@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    SitesModule,
    DataGroupsModule,
    DataGroupFieldsModule,
    NodeGroupsModule,
    DataModule,
    StatusModule,
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
