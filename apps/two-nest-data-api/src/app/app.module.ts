import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config } from '../environments/ormconfig';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SitesModule, DataGroupsModule, FieldsModule, NodeGroupsModule } from '@tamu-gisc/two/data-api';
@Module({
  imports: [TypeOrmModule.forRoot(config), SitesModule, DataGroupsModule, FieldsModule, NodeGroupsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
