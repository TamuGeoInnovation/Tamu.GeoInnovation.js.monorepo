import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { AuthStrategy } from "./open-id-client";
import { SessionSerializer } from "./session-serializer";
import { OidcClientController } from "./oidc-client.controller";
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
export class OidcClientModule { }

