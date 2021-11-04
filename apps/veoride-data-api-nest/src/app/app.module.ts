import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask, Log, StatusChange, Token, Trip, Vehicle } from '@tamu-gisc/veoride/common/entities';
import { VeorideDataApiModule } from '@tamu-gisc/veoride/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig, appConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dbConfig, entities: [DataTask, Token, Trip, StatusChange, Vehicle, Log] }),
    VeorideDataApiModule.register(appConfig)
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
