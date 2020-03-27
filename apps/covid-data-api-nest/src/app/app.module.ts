import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SitesModule, LockdownsModule, StatesModule, CountiesModule } from '@tamu-gisc/covid/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { config } from '../environments/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), SitesModule, LockdownsModule, StatesModule, CountiesModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
