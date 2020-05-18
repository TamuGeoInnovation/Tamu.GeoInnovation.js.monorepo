import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IrgasonValidationService } from '@tamu-gisc/two/valup';
import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { dbConfig } from '@tamu-gisc/two/valup';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig)
  ],
  controllers: [AppController],
  providers: [AppService, IrgasonValidationService]
})
export class AppModule {}
