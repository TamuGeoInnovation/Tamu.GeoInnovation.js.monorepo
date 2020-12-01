import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IrgasonValidationService } from '@tamu-gisc/two/valup';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig)],
  controllers: [AppController],
  providers: [AppService, IrgasonValidationService]
})
export class AppModule {}
