import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Client as OidcClient, custom, generators, Issuer, Strategy, ClientMetadata } from 'openid-client';

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
  public static client: OidcClient;
  public static issuer: Issuer<OidcClient>;
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
  public static async build(clientMetadata: ClientMetadata, clientParams: {}, issuerUrl: string): Promise<OidcClient> {
    this.params = clientParams;
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
  /**
   * Here we set the contents of req.user. We use the access_token
   * from userinfo and exchange it for the user's claims
   *
   * @param {*} tokenset
   * @param {*} userinfo
   * @param {*} done
   * @returns
   * @memberof AuthStrategy
   */
  public async validate(tokenset, userinfo, done) {
    if (!userinfo) {
      throw new UnauthorizedException();
    }
    if (userinfo.access_token) {
      const userClaims = await OpenIdClient.client.userinfo(userinfo.access_token);

      return {
        ...userinfo,
        ...userClaims
      };
    } else {
      return userinfo;
    }
  }
}
