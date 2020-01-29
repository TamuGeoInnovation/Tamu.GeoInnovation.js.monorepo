import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Client, custom, generators, Issuer, Strategy, ClientMetadata } from 'openid-client';

export const ROLE_LEVELS = {
  ADMIN: 99,
  MANAGER: 90,
  USER: 10,
  GUEST: 1
};

/**
 * The main class in NestJS + openid-client integration. 
 * Handles IdP endpoints automatically.
 *
 * @export
 * @class OpenIdClient
 */
export class OpenIdClient {
  public static strategyName = 'oidc';
  public static client: Client;
  public static issuer: Issuer<Client>;
  public static client_options: ClientMetadata = {
    client_id: 'gisday',
    client_secret: "D'WUUUAAAAAAAAAAAAAAHHHHHHHHHHHHHHHH!!!!!!!!!",
    redirect_uris: ['http://localhost:3000/auth/callback'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic'
  };
  public static params = {
    scope: 'openid offline_access basic_profile email tamu roles',
    state: 'texas', // Opaque value set by the RP to maintain state between request and callback
    prompt: 'consent'
  };
  public static code_verifier: string;
  public static code_challenge: string;

  /**
   * Used to initialize our static client; discovers all the endpoints from discovery doc on IdP
   *
   * @static
   * @returns {Promise<Client>}
   * @memberof OpenIdClient
   */
  public static async build(): Promise<Client> {
    // Shadowed name, I know, dunno how to fix it in this particular case. It's kinda needed. -AH (1/29/20)
    const { Client } = await Issuer.discover('http://localhost:4001');

    return new Promise((resolve, reject) => {
      OpenIdClient.client = new Client(OpenIdClient.client_options);
      OpenIdClient.code_verifier = generators.codeVerifier();
      OpenIdClient.code_challenge = generators.codeChallenge(OpenIdClient.code_verifier);
      OpenIdClient.client[custom.clock_tolerance] = 5; // 5 second skew
      custom.setHttpOptionsDefaults({
        timeout: 5000
      });

      resolve(OpenIdClient.client);
    });
  }
}

/**
 * Used by the LoginGuard in the login process. `validate()` will eventually call `serializeUser` for PassportJS.
 *
 * @export
 * @class AuthStrategy
 * @extends {PassportStrategy(Strategy, OpenIdClient.strategyName)}
 */
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, OpenIdClient.strategyName) {
  constructor() {
    super({
      client: OpenIdClient.client,
      params: OpenIdClient.params,
      passReqToCallback: true
    });
  }

  public validate(tokenset, userinfo, done) {
    if (!userinfo) {
      throw new UnauthorizedException();
    }

    return userinfo;
  }
}
