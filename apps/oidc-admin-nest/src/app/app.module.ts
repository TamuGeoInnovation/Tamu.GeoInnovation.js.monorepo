import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OIDC_IDP_ISSUER_URL } from '../environments/oidcconfig';

import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: OIDC_IDP_ISSUER_URL
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClaimsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientController);
  }
}
