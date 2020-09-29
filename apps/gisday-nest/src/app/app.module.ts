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
  SpeakerInfo,
  Sponsor,
  Tag,
  UserClass,
  UserRsvp,
  UserSubmission,
  SubmissionType,
  CheckInModule,
  ClassModule,
  CourseCreditModule,
  EventModule,
  SessionModule,
  SpeakerModule,
  SponsorModule,
  SubmissionTypeModule,
  TagModule,
  UserModule,
  UserClassModule,
  UserRsvpModule,
  UserSubmissionModule
} from '@tamu-gisc/gisday/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OIDC_ISSUER } from '../environments/oidc-client-config';
import { localDbConfig } from '../environments/ormconfig';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: 'http://localhost:4200'
    }),
    // TypeOrmModule.forRoot({
    //   ...localIdpConfig,
    //   entities: [User, UserRole, Role, TokenEndpointAuthMethod, ClientMetadata, GrantType, RedirectUri, ResponseType]
    // }),
    TypeOrmModule.forRoot({
      ...localDbConfig,

      entities: [
        CheckIn,
        Class,
        CourseCredit,
        Event,
        Session,
        Speaker,
        SpeakerInfo,
        SubmissionType,
        Sponsor,
        Tag,
        // User,
        UserClass,
        UserRsvp,
        UserSubmission
      ]
    }),
    CheckInModule,
    ClassModule,
    CourseCreditModule,
    EventModule,
    SessionModule,
    SpeakerModule,
    SponsorModule,
    SubmissionTypeModule,
    TagModule,
    UserModule,
    UserClassModule,
    UserRsvpModule,
    UserSubmissionModule
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
