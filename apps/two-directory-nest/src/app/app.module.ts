import { Module } from '@nestjs/common';

import { DirectoryService } from '@tamu-gisc/two/directory';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DirectoryService]
})
export class AppModule {}
