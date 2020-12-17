import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location, Result } from '@tamu-gisc/ues/recycling/common/entities';
import { LocationsModule, ResultsModule } from '@tamu-gisc/ues/recycling/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [Location, Result]
    }),
    LocationsModule,
    ResultsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
