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
  public static params;
  public static code_verifier: string;
  public static code_challenge: string;

  /**
   * Used to initialize our static client; discovers all the endpoints from discovery doc on IdP
   *
   * @static
   * @returns {Promise<Client>}
   * @memberof OpenIdClient
   */
  public static async build(clientMetadata: ClientMetadata, clientParams: {}, issuerUrl: string): Promise<Client> {
    this.params = clientParams;
    // Shadowed name, I know, dunno how to fix it in this particular case. It's kinda needed. -AH (1/29/20)
    const { Client } = await Issuer.discover(issuerUrl);

    return new Promise((resolve, reject) => {
      OpenIdClient.client = new Client(clientMetadata);
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
