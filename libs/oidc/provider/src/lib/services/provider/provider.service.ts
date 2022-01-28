import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { JWK } from 'node-jose';
import { Configuration, JWKS, Provider, ResourceServer } from 'oidc-provider';

@Injectable()
export class OidcProviderService {
  private devInteractions = false;
  private enableDevLogs = true;
  public provider: Provider;
  public issuerUrl = 'http://localhost:4001';

  constructor() {
    this.generateProviderConfiguration().then((providerConfig) => {
      this.provider = new Provider(this.issuerUrl, providerConfig);
      if (this.enableDevLogs) {
        this.enableOIDCDebug();
      }
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
        backchannelLogout: {
          enabled: true
        },
        devInteractions: { enabled: this.devInteractions }, // defaults to true
        deviceFlow: { enabled: true }, // defaults to false
        issAuthResp: { enabled: true }, // defaults to false
        registration: {
          enabled: true,
          initialAccessToken: false
        },
        userinfo: {
          enabled: false
        },
        registrationManagement: {
          enabled: true
        },
        resourceIndicators: {
          enabled: true,
          useGrantedResource: (ctx, model) => {
            return true;
          },
          getResourceServerInfo: (ctx, resourceIndicator, client) => {
            return {
              accessTokenTTL: 2 * 60 * 60, // 2 hours
              accessTokenFormat: 'jwt',
              jwt: {
                sign: { alg: 'RS256' }
              }
            } as ResourceServer;
          },
          defaultResource: (ctx) => {
            return 'http://localhost:4204';
          }
        },

        revocation: { enabled: true } // defaults to false
      },
      formats: {
        customizers: {
          async jwt(ctx, token, jwt) {
            //jwt.header = { foo: 'bar' }; // Can set header claims
            return jwt;
          }
        }
      },
      interactions: {
        url(ctx, interaction) {
          // eslint-disable-line no-unused-vars
          return `/interaction/${interaction.uid}`;
        }
      },
      issueRefreshToken(ctx, client, code) {
        if (!client.grantTypeAllowed('refresh_token')) {
          return false;
        }
        return (
          code.scopes.has('offline_access') ||
          (client.applicationType === 'web' && client.tokenEndpointAuthMethod === 'none')
        );
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
          post_logout_redirect_uris: ['http://localhost:4204'] // cannot log out if you don't set this. Note uri(s) is plural and takes an array
        }
      ],
      cookies: {
        keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more']
      }
    };
  }

  public enableOIDCDebug() {
    const idp = this.provider;
    idp.addListener('server_error', (ctx, error) => {
      console.error(error.message);
      throw error;
    });
    idp.addListener('authorization.accepted', (ctx) => {
      console.log('authorization.accepted');
    });
    idp.addListener('interaction.started', (detail, ctx) => {
      console.log('interaction.started');
    });
    idp.addListener('interaction.ended', (ctx) => {
      console.log('interaction.ended');
    });
    idp.addListener('authorization.success', (ctx) => {
      console.log('authorization.success');
    });
    idp.addListener('authorization.error', (error, ctx) => {
      console.log('authorization.error');
      console.error(error);
    });

    idp.addListener('grant.success', (ctx) => {
      console.log('grant.success');
    });

    idp.addListener('grant.error', (error, ctx) => {
      console.log('grant.error');
      console.error(ctx);
    });

    idp.addListener('certificates.error', (error, ctx) => {
      console.log('certificates.error');
      console.error(error);
    });

    idp.addListener('discovery.error', (error, ctx) => {
      console.log('discovery.error');
      console.error(error);
    });

    idp.addListener('introspection.error', (error, ctx) => {
      console.log('introspection.error');
      console.error(error);
    });

    idp.addListener('revocation.error', (error, ctx) => {
      console.log('revocation.error');
      console.error(error);
    });

    idp.addListener('registration_create.success', (client, ctx) => {
      console.log('registration_create.success');
    });

    idp.addListener('registration_create.error', (error, ctx) => {
      console.log('registration_create.error');
      console.error(error);
    });

    idp.addListener('registration_read.error', (error, ctx) => {
      console.log('registration_read.error');
      console.error(error);
    });

    idp.addListener('registration_update.success', (client, ctx) => {
      console.log('registration_update.success');
    });

    idp.addListener('registration_update.error', (error, ctx) => {
      console.log('registration_update.error');
      console.error(error);
    });

    idp.addListener('registration_delete.success', (client, ctx) => {
      console.log('registration_delete.success');
    });

    idp.addListener('registration_delete.error', (error, ctx) => {
      console.log('registration_delete.error');
      console.error(error);
    });

    idp.addListener('userinfo.error', (error, ctx) => {
      console.log('userinfo.error');
      console.error(error);
    });

    idp.addListener('check_session.error', (error, ctx) => {
      console.log('check_session.error');
      console.error(error);
    });

    idp.addListener('check_session_origin.error', (error, ctx) => {
      console.log('check_session_origin.error');
      console.error(error);
    });

    idp.addListener('webfinger.error', (error, ctx) => {
      console.log('webfinger.error');
      console.error(error);
    });

    idp.addListener('token.issued', (token) => {
      console.log('token.issued');
    });

    idp.addListener('token.consumed', (token) => {
      console.log('token.consumed');
    });

    idp.addListener('token.revoked', (token) => {
      console.log('token.revoked');
    });

    idp.addListener('grant.revoked', (grantId) => {
      console.log('grant.revoked');
    });

    idp.addListener('end_session.success', (ctx) => {
      console.log('end_session.success');
    });
    idp.addListener('end_session.error', (error, ctx) => {
      console.log('end_session.error');
      console.error(error);
    });
    idp.addListener('backchannel.success', (client: Provider, accoundId: string, sid: string, ctx) => {
      console.log('backchannel.success');
    });
    idp.addListener('backchannel.error', (error, client: Provider, accoundId: string, sid: string, ctx) => {
      console.log('backchannel.error');
      console.error(error);
    });
  }
}
