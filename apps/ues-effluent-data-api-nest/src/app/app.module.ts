import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location, Result } from '@tamu-gisc/ues/effluent/common/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [Location, Result]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
