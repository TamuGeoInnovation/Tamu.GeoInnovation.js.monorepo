import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { JWK } from 'node-jose';
import { Configuration, JWKS, Provider } from 'oidc-provider';

@Injectable()
export class OidcProviderService {
  private devInteractions = false;
  public provider: Provider;
  public issuerUrl = 'http://localhost:4001';

  constructor() {
    this.generateProviderConfiguration().then((providerConfig) => {
      this.provider = new Provider(this.issuerUrl, providerConfig);
    });
  }

  public async generateProviderConfiguration(): Promise<Configuration> {
    const baseProviderConfig: Configuration = {
      claims: {
        address: ['address'],
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: [
          'birthdate',
          'family_name',
          'gender',
          'given_name',
          'locale',
          'middle_name',
          'name',
          'nickname',
          'picture',
          'preferred_username',
          'profile',
          'updated_at',
          'website',
          'zoneinfo'
        ]
      },
      clientBasedCORS(ctx, origin, client) {
        return true; // Must be set to true or angular-auth-oidc-client wont work right
      },
      enabledJWA: {
        authorizationEncryptionAlgValues: ['RSA-OAEP-256'], // Is this what we want?
        authorizationEncryptionEncValues: ['A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM'], // Defaults
        authorizationSigningAlgValues: ['RS256'],
        dPoPSigningAlgValues: ['RS256'],
        idTokenEncryptionAlgValues: ['RSA-OAEP'], // Is this what we want?
        idTokenEncryptionEncValues: ['A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM'], // Defaults
        idTokenSigningAlgValues: ['RS256'],
        introspectionEncryptionAlgValues: ['RSA-OAEP'], // Is this what we want?
        introspectionEncryptionEncValues: ['A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM'], // Defaults
        introspectionSigningAlgValues: ['RS256', 'PS256', 'ES256', 'EdDSA'], // Defaults
        requestObjectEncryptionAlgValues: ['RSA-OAEP'], // Is this what we want?
        requestObjectEncryptionEncValues: ['A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM'], // Defaults
        requestObjectSigningAlgValues: ['HS256', 'RS256', 'PS256', 'ES256', 'EdDSA'], // Defaults
        tokenEndpointAuthSigningAlgValues: ['RS256'],
        userinfoEncryptionAlgValues: ['RSA-OAEP'], // Is this what we want?
        userinfoEncryptionEncValues: ['A128CBC-HS256', 'A128GCM', 'A256CBC-HS512', 'A256GCM'], // Defaults
        userinfoSigningAlgValues: ['RS256']
      },
      features: {
        devInteractions: { enabled: this.devInteractions }, // defaults to true
        deviceFlow: { enabled: true }, // defaults to false
        issAuthResp: { enabled: true }, // defaults to false
        registration: {
          enabled: true,
          initialAccessToken: false
        },
        registrationManagement: {
          enabled: true
        },
        revocation: { enabled: true } // defaults to false
      },
      interactions: {
        url(ctx, interaction) {
          // eslint-disable-line no-unused-vars
          return `/interaction/${interaction.uid}`;
        }
      }
    };

    const keystore = JWK.createKeyStore();

    await keystore.generate('RSA', 2048, {
      alg: 'RS256',
      use: 'sig'
    });

    const jwks: JWKS = keystore.toJSON(true) as JWKS;

    // Some properties shouldn't be stored in git such as the keys and clients, cookies, etc
    return {
      ...baseProviderConfig,
      jwks: jwks,
      clients: [
        {
          client_id: 'angularCodeRefreshTokens',
          client_secret: '...',
          grant_types: ['refresh_token', 'authorization_code'],
          redirect_uris: ['http://localhost:4204'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          post_logout_redirect_uri: 'http://localhost:4204'
        }
      ],
      cookies: {
        keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more']
      }
    };
  }
}
