import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config } from '../environments/ormconfig';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SitesModule } from '@tamu-gisc/two/data-api';
@Module({
  imports: [SitesModule, TypeOrmModule.forRoot(config)],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
