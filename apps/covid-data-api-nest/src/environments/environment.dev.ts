import { ClientMetadata } from 'openid-client';

export const environment = {
  production: true,
  port: 27023,
  globalPrefix: ''
};

export const OIDC_CLIENT_METADATA: ClientMetadata = {
  client_id: 'covid-api',
  client_secret: 'pppssssssttttheykidwantsomekandy',
  redirect_uris: ['http://localhost:3333/api/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic'
};

export const OIDC_IDP_ISSUER_URL = 'http://localhost:4001';

export const OIDC_CLIENT_PARAMS = {
  scope: 'openid offline_access basic_profile email tamu role',
  state: 'texas', // Opaque value set by the RP to maintain state between request and callback
  prompt: 'consent'
};


export { devDbConfig as dbConfig } from './ormconfig';
