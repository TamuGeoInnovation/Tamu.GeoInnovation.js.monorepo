import { readFileSync, writeFile } from 'fs';
import { Injectable } from '@nestjs/common';

import { JWK } from 'node-jose';
import { Configuration, JWKS, Provider, ResourceServer } from 'oidc-provider';

import { AccountService, UserRoleService } from '@tamu-gisc/oidc/common';
import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { OidcAdapter } from '../../adapters/oidc.adapter';

@Injectable()
export class OidcProviderService {
  private devInteractions = false;
  private enableDevLogs = true;
  public provider: Provider;
  public issuerUrl = 'http://localhost:4001';

  // TODO: Get file name / path from environment
  private pathToJWKS = 'idp_keystore.json';

  constructor(
    private readonly accountService: AccountService,
    private readonly userRoleService: UserRoleService,
    private readonly env: EnvironmentService
  ) {
    this.getJWKSFromFile().then((jwks) => {
      this.generateProviderConfiguration(jwks).then((providerConfig) => {
        this.provider = new Provider(this.issuerUrl, providerConfig);
        if (this.enableDevLogs) {
          this.enableOIDCDebug();
        }

        this.provider.proxy = true;
      });
    });
  }

  private async getJWKSFromFile() {
    try {
      const contents = readFileSync(this.pathToJWKS, 'utf8');
      return contents;
    } catch (err) {
      console.log('no file, generate keystore and write it', err);

      const keystore = JWK.createKeyStore();

      await keystore.generate('RSA', 2048, {
        alg: 'RS256',
        use: 'sig'
      });

      const jwks = keystore.toJSON(true) as JWKS;

      writeFile('idp_keystore.json', JSON.stringify(jwks), (err) => {
        if (err) {
          console.warn(err);
          return;
        }
      });

      return JSON.stringify(jwks);
    }
  }

  public async generateProviderConfiguration(jwks): Promise<Configuration> {
    const accountService = this.accountService;
    const userRoleService = this.userRoleService;

    const baseProviderConfig: Configuration = {
      adapter: OidcAdapter,
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
      clientBasedCORS() {
        return true; // Must be set to true or angular-auth-oidc-client wont work right
      },
      clockTolerance: 5, // In seconds
      conformIdTokenClaims: true, // defaults to true
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
      extraTokenClaims(ctx, token) {
        console.log('extraTokenClaims', token);
        return {
          'urn:oidc-provider:example:foo': 'bar'
        };
      },
      features: {
        backchannelLogout: {
          enabled: true
        },
        devInteractions: { enabled: this.devInteractions }, // defaults to true
        deviceFlow: { enabled: true }, // defaults to false
        // issAuthResp: { enabled: true }, // Was a property in v6, not v7. Will keep in case Panva adds back. Defaults to false
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
          useGrantedResource: () => {
            return true;
          },
          getResourceServerInfo: () => {
            return {
              accessTokenTTL: 2 * 60 * 60, // 2 hours
              accessTokenFormat: 'jwt',
              jwt: {
                sign: { alg: 'RS256' }
              }
            } as ResourceServer;
          },
          defaultResource: (ctx) => {
            return ctx.request.header.referer;
          }
        },
        revocation: { enabled: true } // defaults to false
      },
      async findAccount(ctx, sub) {
        return {
          accountId: sub,
          async claims(use, scope, claims, rejected) {
            console.log('findAccount -> claims', use, scope, claims, rejected);
            const account = await accountService.accountRepo.findOne({
              where: {
                guid: sub
              }
            });
            return { sub: account.guid, name: account.name };
          }
        };
      },
      formats: {
        customizers: {
          async jwt(ctx, token, jwt) {
            //jwt.header = { foo: 'bar' }; // Can set header claims
            // jwt.payload.foo = 'bar'; // Can set payload claims

            // jwt.payload.sub is the Account guid for the user.
            // Can we use dependency injection to then query user_roles and append said role?
            // If no role / client combination is found we default to a plain 'user' role
            // TODO: If we enable dynamic client registration, how do we maintain a list of role / client guid's that isn't changing every time a site has to register?
            // TODO: Maybe we just use the client_id attribute instead of a guid, since the client_id is a name that wouldn't change between registrations
            // console.log(ctx, token, jwt);
            // const account = await accountService.get(jwt.payload.sub);
            // jwt.payload.role = 'user'; // TODO: Add back authorization; this is a way to "fudge" it

            // Get all user roles with the accountGuid
            const userRoles = await userRoleService.getRoles(jwt.payload.sub);

            const roles = userRoles.map((val) => {
              return {
                id: val.client.id,
                level: val.role.level
              };
            });

            if (userRoles) {
              jwt.payload.roles = roles;
            }

            return jwt;
          }
        }
      },
      interactions: {
        url(ctx, interaction) {
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

    // Some properties shouldn't be stored in git such as the keys and clients, cookies, etc
    return {
      ...baseProviderConfig,
      jwks: JSON.parse(jwks),
      clients: [
        {
          client_id: this.env.value('client_id'),
          redirect_uris: this.env.value('redirect_uris'),
          token_endpoint_auth_method: this.env.value('token_endpoint_auth_method'),
          post_logout_redirect_uris: this.env.value('post_logout_redirect_uris')
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

    idp.addListener('authorization.accepted', () => {
      console.log('authorization.accepted');
    });

    idp.addListener('interaction.started', () => {
      console.log('interaction.started');
    });

    idp.addListener('interaction.ended', () => {
      console.log('interaction.ended');
    });

    idp.addListener('authorization.success', () => {
      console.log('authorization.success');
    });

    idp.addListener('authorization.error', (error) => {
      console.log('authorization.error');
      console.error(error);
    });

    idp.addListener('grant.success', () => {
      console.log('grant.success');
    });

    idp.addListener('grant.error', (ctx) => {
      console.log('grant.error');
      console.error(ctx);
    });

    idp.addListener('certificates.error', (error) => {
      console.log('certificates.error');
      console.error(error);
    });

    idp.addListener('discovery.error', (error) => {
      console.log('discovery.error');
      console.error(error);
    });

    idp.addListener('introspection.error', (error) => {
      console.log('introspection.error');
      console.error(error);
    });

    idp.addListener('revocation.error', (error) => {
      console.log('revocation.error');
      console.error(error);
    });

    idp.addListener('registration_create.success', () => {
      console.log('registration_create.success');
    });

    idp.addListener('registration_create.error', (error) => {
      console.log('registration_create.error');
      console.error(error);
    });

    idp.addListener('registration_read.error', (error) => {
      console.log('registration_read.error');
      console.error(error);
    });

    idp.addListener('registration_update.success', () => {
      console.log('registration_update.success');
    });

    idp.addListener('registration_update.error', (error) => {
      console.log('registration_update.error');
      console.error(error);
    });

    idp.addListener('registration_delete.success', () => {
      console.log('registration_delete.success');
    });

    idp.addListener('registration_delete.error', (error) => {
      console.log('registration_delete.error');
      console.error(error);
    });

    idp.addListener('userinfo.error', (error) => {
      console.log('userinfo.error');
      console.error(error);
    });

    idp.addListener('check_session.error', (error) => {
      console.log('check_session.error');
      console.error(error);
    });

    idp.addListener('check_session_origin.error', (error) => {
      console.log('check_session_origin.error');
      console.error(error);
    });

    idp.addListener('webfinger.error', (error) => {
      console.log('webfinger.error');
      console.error(error);
    });

    idp.addListener('token.issued', () => {
      console.log('token.issued');
    });

    idp.addListener('token.consumed', () => {
      console.log('token.consumed');
    });

    idp.addListener('token.revoked', () => {
      console.log('token.revoked');
    });

    idp.addListener('grant.revoked', () => {
      console.log('grant.revoked');
    });

    idp.addListener('end_session.success', () => {
      console.log('end_session.success');
    });
    idp.addListener('end_session.error', (error) => {
      console.log('end_session.error');
      console.error(error);
    });

    idp.addListener('backchannel.success', () => {
      console.log('backchannel.success');
    });

    idp.addListener('backchannel.error', (error) => {
      console.log('backchannel.error');
      console.error(error);
    });
  }
}
