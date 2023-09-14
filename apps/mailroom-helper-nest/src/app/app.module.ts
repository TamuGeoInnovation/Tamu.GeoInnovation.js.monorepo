import { Module } from '@nestjs/common';

import { HelperModule } from '@tamu-gisc/mailroom/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HelperModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
