import { Module } from '@nestjs/common';

import { GisdayCompetitionsModule } from '@tamu-gisc/gisday/competitions';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [GisdayCompetitionsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
