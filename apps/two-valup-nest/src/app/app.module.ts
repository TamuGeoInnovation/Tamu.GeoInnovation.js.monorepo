import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IrgasonValidationService, FileAccessPipe } from '@tamu-gisc/two/valup';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, IrgasonValidationService]
})
export class AppModule {}
