import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

import {
  CheckIn,
  Class,
  CourseCredit,
  Event,
  Session,
  Speaker,
  SubmissionType,
  Sponsor,
  Tag,
  UserClass,
  UserRsvp,
  UserSubmission
} from '@tamu-gisc/gisday/nest';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OIDC_ISSUER } from '../environments/oidc-client-config';
import { localDbConfig } from '../environments/ormconfig';

@Module({
  imports: [
    // OidcClientModule.forRoot({
    //   host: OIDC_ISSUER
    // }),
    TypeOrmModule.forRoot({
      ...localDbConfig,
      entities: [
        // CheckIn,
        Class,
        // CourseCredit,
        Event,
        Session,
        Speaker,
        // SubmissionType,
        Sponsor,
        Tag
        // UserClass,
        // UserRsvp,
        // UserSubmission
      ]
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
