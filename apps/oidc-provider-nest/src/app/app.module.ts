import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import  { InteractionModule, UserModule } from '@tamu-gisc/oidc/provider-nest';

@Module({
  imports: [InteractionModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
