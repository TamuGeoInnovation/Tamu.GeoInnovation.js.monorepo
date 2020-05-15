import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DirectoryService } from '@tamu-gisc/two/directory';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DirectoryService],
})
export class AppModule {}
