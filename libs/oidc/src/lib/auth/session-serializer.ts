import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * Injectable used in the OidcClientModule. Defines PassportJS `serializeUser` and `deserializeUser` methods.
 * Necessary for Passport to work nicely with NestJS.
 * @export
 * @class SessionSerializer
 * @extends {PassportSerializer}
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  public serializeUser(user, done: (err: Error, user) => void): void {
    done(null, user);
  }

  public deserializeUser(payload, done: (err: Error, payload: string) => void): void {
    done(null, payload);
  }
}
