import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { AuthStrategy } from "./open-id-client";
import { SessionSerializer } from "./session-serializer";
import { OidcClientController } from "./oidc-client-controller.controller";
import { ClaimsMiddleware } from "../middleware/claims.middleware";

@Module({
  imports: [
    PassportModule.register(
      {
        session: true,
      }
    ),
  ],
  providers: [AuthStrategy, SessionSerializer],
  exports: [],
  controllers: [OidcClientController],
})
export class OidcClientModule implements NestModule { 
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClaimsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientModule);
  }
}

