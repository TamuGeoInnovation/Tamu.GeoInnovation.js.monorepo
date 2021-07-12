import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { OidcClientModule, OidcClientController, GroupClaimsMiddleware } from '@tamu-gisc/oidc/client';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { idpConfig } from '../environments/environment';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: idpConfig.issuer_url,
      roles: idpConfig.roles
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GroupClaimsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientController);
  }
}
