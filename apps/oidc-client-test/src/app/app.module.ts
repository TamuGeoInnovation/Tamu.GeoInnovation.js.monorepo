import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OidcClientModule,  } from '@tamu-gisc/oidc';

@Module({
  imports: [OidcClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
