import { Module } from '@nestjs/common';

import { GeoservicesDataApiModule } from '@tamu-gisc/geoservices/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [GeoservicesDataApiModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
