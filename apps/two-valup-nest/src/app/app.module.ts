import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IrgasonValidationService } from '@tamu-gisc/two/valup';
import { dbConfig } from '@tamu-gisc/two/valup';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig)],
  controllers: [AppController],
  providers: [AppService, IrgasonValidationService]
})
export class AppModule {}
