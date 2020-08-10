## Launching

`ng serve oidc-provider-express`

## Configuration

This project requires a collection of configuration options in `src/environments/oidc-provider-config.ts`.

```js
import { AccountManager, IOIDCClient, IOIDCKeys } from '@tamu-gisc/oidc/provider';

export const provider_config = {
  acrValues: ['urn:mace:incommon:iap:bronze'],
  clockTolerance: 60 * 1, // number of seconds to accomedate system clock skews
  cookies: {
    long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
    short: { signed: true },
    keys: ['keys'],
    names: {
      session: '_session',
      interaction: '_grant',
      resume: '_grant',
      state: '_state'
    }
  },
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
    tamu: ['tamu'],
    tamu_new: ['completed_initial_survey_tamu', 'uin_tamu', 'field_of_study_tamu', 'department_tamu', 'classification_tamu'],
    role: ['role'],
    role_new: ['name_role', 'level_role']
  },
  features: {
    devInteractions: false, // defaults to true
    // discovery: true, // defaults to true
    // requestUri: true, // defaults to true
    // oauthNativeApps: true, // defaults to true
    // pkce: true, // defaults to true
    backchannelLogout: true, // defaults to false
    claimsParameter: true, // defaults to false
    deviceFlow: true, // defaults to false
    encryption: true, // defaults to false
    frontchannelLogout: true, // defaults to false
    introspection: true, // defaults to false
    jwtIntrospection: true, // defaults to false
    registration: true, // defaults to false
    request: true, // defaults to false
    revocation: true, // defaults to false
    sessionManagement: true, // defaults to false
    webMessageResponseMode: true, // defaults to false
    jwtResponseModes: true // defaults to false
  },
  // findById: NewAccount.findById,
  findById: async (req, id: string, token) => {
    // const clientId = "siteA";
    const clientId = req.oidc.client.clientId;
    // tslint:disable-next-line: no-any
    const user: any = await AccountManager.getAccountTAMU(id);
    // tslint:disable-next-line: no-any
    const userrole: any = await AccountManager.getUsersRoleBySite(id, clientId);
    // findById will trim those values returned here NOT EXPLICITLY STATED
    // inside the client's requested claims; the client (RP) has to request
    // claims for values returned here
    const tamu = {
      completed_initial_survey_tamu: user.completed_initial_survey_tamu,
      uin_tamu: user.uin_tamu,
      field_of_study_tamu: user.fieldofstudy_tamu,
      department_tamu: user.department_tamu,
      classification_tamu: user.classification_tamu
    };

    const role = {
      name_role: userrole.role,
      level_role: userrole.level
    };

    return {
      accountId: id,
      claims: () => {
        return {
          sub: id,
          ...user.account.dataValues,
          ...user.dataValues,
          name_role: role.name_role,
          level_role: role.level_role,
          tamu: {
            ...tamu
          },
          role: {
            ...role
          }
        };
      }
    };
  },
  formats: {
    default: 'opaque',
    AccessToken: 'jwt'
  },
  interactionUrl: function interactionUrl(ctx, interaction) {
    return `/interaction/${ctx.oidc.uuid}`;
  },
  logoutSource: function logoutSource(ctx, form: string) {
    ctx.body = `<!DOCTYPE html>
      <head>
      <title>Logout Request</title>
      <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
      </head>
      <body>
      <div>
        <h1>Do you want to sign-out from ${ctx.host}?</h1>
        <script>
          function logout() {
            var form = document.getElementById('op.logoutForm');
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'logout';
            input.value = 'yes';
            form.appendChild(input);
            form.submit();
          }
          function rpLogoutOnly() {
            var form = document.getElementById('op.logoutForm');
            form.submit();
          }
        </script>
        ${form}
        <button onclick="logout()">Yes, sign me out</button>
        <button onclick="rpLogoutOnly()">No, stay signed in</button>
      </div>
      </body>
      </html>`;
  },
  httpOptions: function httpOptions(options) {
    options.followRedirect = false;
    options.headers['User-Agent'] = 'oidc-provider/${VERSION} (${ISSUER_IDENTIFIER})';
    options.retry = 0;
    options.throwHttpErrors = false;
    options.timeout = 2500;
    return options;
  },
  proxy: true,
  clientCacheDuration: 1 * 24 * 60 * 60, // 1 day in seconds,
  ttl: {
    // AccessToken: 1 * 40, // 40 seconds
    AccessToken: 1 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60, // 1 hour in seconds
    // IdToken: 1 * 60, // 1 minute in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds

    // HEROKU EXAMPLE ONLY, do not use the following expiration unless you want to drop dynamic
    //   registrations 24 hours after registration
    RegistrationAccessToken: 1 * 24 * 60 * 60 // 1 day in seconds
  }
};

export const clients: Array<IOIDCClient> = [
  {
    client_id: 'client-id',
    client_secret: 'secret goes here',
    grant_types: ['refresh_token', 'authorization_code'],
    redirect_uris: ['callback auth url'],
    token_endpoint_auth_method: 'method',
    post_logout_redirect_uris: ['logout post url'],
    backchannel_logout_session_required: true,
    backchannel_logout_uri: 'logout url'
  }
];

export const keys: IOIDCKeys = [
  {
    d: '',
    dp: '',
    dq: '',
    e: '',
    kty: '',
    n: '',
    p: '',
    q: '',
    qi: '',
    use: '',
  },
  {
    d: '',
    dp: '',
    dq: '',
    e: '',
    kty: '',
    n: '',
    p: '',
    q: '',
    qi: '',
    use: '',
  },
  {
    crv: '',,
    d: '',
    kty: '',
    x: '',
    y: '',
  }
];
```
