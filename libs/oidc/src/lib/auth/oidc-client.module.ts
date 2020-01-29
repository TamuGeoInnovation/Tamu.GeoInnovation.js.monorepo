import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { AuthStrategy } from "./open-id-client";
import { SessionSerializer } from "./session-serializer";

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
  controllers: [],
})
export class OidcClientModule { }

