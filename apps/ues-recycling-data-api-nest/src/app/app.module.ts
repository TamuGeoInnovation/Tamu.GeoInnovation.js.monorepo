import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location, Result } from '@tamu-gisc/ues/recycling/common/entities';
import { LocationsModule, ResultsModule } from '@tamu-gisc/ues/recycling/data-api';
import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig, idpConfig } from '../environments/environment';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: idpConfig.issuer_url
    }),
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [Location, Result]
    }),
    LocationsModule,
    ResultsModule
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
