// import Provider from 'oidc-provider';
import { Provider, Configuration, ClientMetadata } from 'oidc-provider';
const {
  interactionPolicy: { Prompt, base: policy }
} = require('oidc-provider');
import { Account, User, IClientMetadata, Role, UserRole } from '../entities/all.entity';
import { StaticAccountService } from '../services/account/account.service';
import { OidcAdapter } from '../adapters/oidc.adapter';

export class OpenIdProvider {
  public static provider: Provider;

  static async build(clients?: IClientMetadata[]): Promise<Provider> {
    // TODO: Fix this cast to unknown
    return new Promise(async (resolve, reject) => {
      // OpenIdProvider.provider = new Provider('http://localhost:4001', (loadableProviderConfiguration(
      //   clients
      // ) as unknown) as Configuration);
      if (clients) {
        OpenIdProvider.provider = new Provider('http://localhost:4001', loadableProviderConfiguration(clients));
      } else {
        OpenIdProvider.provider = new Provider(
          'http://localhost:4001',
          (PROVIDER_CONFIGURATION as unknown) as Configuration
        );
      }
      // if (clientService) {
      //   const clients = await clientService.loadClientMetadaForOidcSetup();
      //   if (clients) {
      //     OpenIdProvider.provider = new Provider('http://localhost:4001', loadableProviderConfiguration(clients));
      //   }
      // }
      resolve();
    });
  }
}

const {
  JWKS: { KeyStore }
} = require('jose');
const keystore = new KeyStore();
keystore.generateSync('RSA', 2048, { alg: 'RS256', use: 'sig' });
console.log('this is the full private JWKS:\n', keystore.toJWKS(true));

const interactions = policy();

// create a requestable prompt with no implicit checks
const selectAccount = new Prompt({
  name: 'select_account',
  requestable: true
});

// add to index 0, order goes select_account > login > consent
interactions.add(selectAccount, 0);

function loadableProviderConfiguration(clients: IClientMetadata[]) {
  const PROVIDER_CONFIGURATION = {
    acrValues: ['urn:mace:incommon:iap:bronze'],
    adapter: OidcAdapter,
    cookies: {
      long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
      short: { signed: true },
      keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
      names: {
        interaction: '_interaction',
        resume: '_interaction_resume',
        session: '_session',
        state: '_state'
      }
    },
    // clients: [
    //   {
    //     client_id: 'oidc-client-test',
    //     client_secret: 'pppssssssttttheykidwantsomekandy',
    //     grant_types: ['refresh_token', 'authorization_code'],
    //     redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
    //     response_types: ['code'],
    //     token_endpoint_auth_method: 'client_secret_basic'
    //   }
    // ],
    clients: clients,
    claims: {
      // amr: null,
      amr: ['pwd', 'otp'],
      address: ['address'],
      email: ['email', 'email_verified'],
      phone: ['phone_number', 'phone_number_verified'],
      basic_profile: ['name', 'family_name', 'given_name', 'profile'],
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
      ],
      tamu: [
        'tamu', // if we include the scope name here, we can have objects in our claims
        'completed_initial_survey_tamu',
        'uin_tamu',
        'field_of_study_tamu',
        'department_tamu',
        'classification_tamu'
      ],
      role: ['role', 'name_role', 'level_role', 'client_role']
    },
    conformIdTokenClaims: true,
    async findAccount(req, id: string, token) {
      const clientId = req.oidc.client.clientId;
      // TODO: It isn't too apparent how to determine if we need to return role or not
      // depending on the claims approved by the user
      const account: Account = await StaticAccountService.findByKey(Account, 'guid', id);
      const user: User = await StaticAccountService.getUserRoles(id, clientId);
      // The problem with this method is it scrubs the clientMetada so we don't know what sites have what permissions
      // const roles = [];
      // user.userRoles.map((userRole) => {
      //   roles.push({
      //     name_role: userRole.role.name,
      //     level_role: userRole.role.level,
      //     client_role: userRole.client.clientName
      //   });
      // });

      // TODO: This isn't smart to have the [0] index of the userRoles array
      let ret = {};
      if (user) {
        ret = {
          sub: user.account.guid,
          ...user.account,
          role: {
            name_role: user.userRoles[0].role.name,
            level_role: user.userRoles[0].role.level,
            client_role: user.userRoles[0].client.clientName
          }
        };
      } else {
        console.warn('No roles found');
        ret = {
          sub: account.guid,
          ...account
        };
      }

      return {
        accountId: account.guid,
        async claims(use: string, scope: string, claims: {}, rejected: string[]) {
          return ret;
        }
      };
    },
    jwks: keystore.toJWKS(true),
    features: {
      devInteractions: {
        enabled: false
      },
      claimsParameter: {
        enabled: true
      },
      introspection: {
        enabled: true
      },
      jwtIntrospection: {
        enabled: true
      },
      revocation: {
        enabled: true
      },
      sessionManagement: {
        enabled: true
      },
      webMessageResponseMode: {
        enabled: true
      },
      jwtResponseModes: {
        enabled: true
      },
      jwtUserinfo: {
        enabled: true
      },
      userinfo: {
        enabled: true
      }
    },
    formats: {
      AccessToken: 'jwt',
      ClientCredentials: 'opaque'
    },
    // routes: {
    //   authorization: '/auth',
    //   userinfo: '/me'
    // },
    interactions: {
      policy: interactions,
      url(ctx) {
        return `/interaction/${ctx.oidc.uid}`;
        // return `/auth`;
      }
    },
    ttl: {
      // AccessToken: 1 * 40, // 40 seconds
      AccessToken: 1 * 60 * 60, // 1 hour in seconds
      AuthorizationCode: 10 * 60, // 10 minutes in seconds
      IdToken: 1 * 60 * 60, // 1 hour in seconds
      // IdToken: 1 * 60, // 1 minute in seconds
      DeviceCode: 10 * 60, // 10 minutes in seconds
      RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds

      // HEROKU EXAMPLE ONLY, do not use the following expiration unless you want to drop dynamic
      //   registrations 24 hours after registration
      RegistrationAccessToken: 1 * 24 * 60 * 60 // 1 day in seconds
    }
  };
  return (PROVIDER_CONFIGURATION as unknown) as Configuration;
}

export const PROVIDER_CONFIGURATION = {
  acrValues: ['urn:mace:incommon:iap:bronze'],
  adapter: OidcAdapter,
  cookies: {
    long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
    short: { signed: true },
    keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
    names: {
      interaction: '_interaction',
      resume: '_interaction_resume',
      session: '_session',
      state: '_state'
    }
  },
  clients: [
    {
      client_id: 'oidc-client-test',
      client_secret: 'pppssssssttttheykidwantsomekandy',
      grant_types: ['refresh_token', 'authorization_code'],
      redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_basic'
    }
  ],
  // clients: clients,
  claims: {
    amr: null,
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    basic_profile: ['name', 'family_name', 'given_name', 'profile'],
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
    ],
    tamu: [
      'tamu', // if we include the scope name here, we can have objects in our claims
      'completed_initial_survey_tamu',
      'uin_tamu',
      'field_of_study_tamu',
      'department_tamu',
      'classification_tamu'
    ],
    role: ['role', 'name_role', 'level_role', 'client_role']
  },
  conformIdTokenClaims: true,
  async findAccount(req, id: string, token) {
    const clientId = req.oidc.client.clientId;
    // TODO: It isn't too apparent how to determine if we need to return role or not
    // depending on the claims approved by the user
    const account: Account = await StaticAccountService.findByKey(Account, 'guid', id);
    const user: User = await StaticAccountService.getUserRoles(id, clientId);
    // The problem with this method is it scrubs the clientMetada so we don't know what sites have what permissions
    // const roles = [];
    // user.userRoles.map((userRole) => {
    //   roles.push({
    //     name_role: userRole.role.name,
    //     level_role: userRole.role.level,
    //     client_role: userRole.client.clientName
    //   });
    // });

    // TODO: This isn't smart to have the [0] index of the userRoles array
    let ret = {};
    if (user) {
      ret = {
        sub: user.account.guid,
        ...user.account,
        role: {
          name_role: user.userRoles[0].role.name,
          level_role: user.userRoles[0].role.level,
          client_role: user.userRoles[0].client.clientName
        }
      };
    } else {
      console.warn('No roles found');
      ret = {
        sub: account.guid,
        ...account
      };
    }

    return {
      accountId: account.guid,
      async claims(use: string, scope: string, claims: {}, rejected: string[]) {
        return ret;
      }
    };
  },
  jwks: keystore.toJWKS(true),
  features: {
    devInteractions: {
      enabled: false
    },
    claimsParameter: {
      enabled: true
    },
    introspection: {
      enabled: true
    },
    jwtIntrospection: {
      enabled: true
    },
    revocation: {
      enabled: true
    },
    sessionManagement: {
      enabled: true
    },
    webMessageResponseMode: {
      enabled: true
    },
    jwtResponseModes: {
      enabled: true
    },
    jwtUserinfo: {
      enabled: true
    },
    userinfo: {
      enabled: true
    }
  },
  formats: {
    AccessToken: 'jwt',
    ClientCredentials: 'opaque'
  },
  // routes: {
  //   authorization: '/auth',
  //   userinfo: '/me'
  // },
  interactions: {
    policy: interactions,
    url(ctx) {
      return `/interaction/${ctx.oidc.uid}`;
      // return `/auth`;
    }
  },
  ttl: {
    AccessToken: 1 * 60, // 40 seconds
    // AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    // IdToken: 1 * 60, // 1 minute in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds

    // HEROKU EXAMPLE ONLY, do not use the following expiration unless you want to drop dynamic
    //   registrations 24 hours after registration
    RegistrationAccessToken: 1 * 24 * 60 * 60 // 1 day in seconds
  }
};
