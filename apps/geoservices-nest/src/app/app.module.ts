import { Module } from '@nestjs/common';

import { ContactModule } from '@tamu-gisc/geoservices/data-api';
import { EnvironmentModule } from '@tamu-gisc/common/nest/environment';

import { environment } from '../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ContactModule, EnvironmentModule.forRoot(environment)],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
