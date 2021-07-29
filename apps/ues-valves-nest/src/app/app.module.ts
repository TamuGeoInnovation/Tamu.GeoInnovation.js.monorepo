import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { OidcClientModule } from '@tamu-gisc/oidc/client';
import { InterventionModule } from '@tamu-gisc/ues/cold-water/data-api';
import { UserGroupsMiddleware } from '@tamu-gisc/ues/common/nest';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { idpConfig, interventionApiUrl, roles } from '../environments/environment';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: idpConfig.issuer_url
    }),
    InterventionModule.forRoot(interventionApiUrl)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ROLES',
      useValue: roles
    }
  ]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserGroupsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
