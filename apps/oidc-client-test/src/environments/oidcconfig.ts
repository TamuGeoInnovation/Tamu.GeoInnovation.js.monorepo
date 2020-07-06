import { ClientMetadata } from 'openid-client';

// export const OIDC_CLIENT_METADATA: ClientMetadata = {
//   client_id: 'oidc-client-test',
//   client_secret: 'pppssssssttttheykidwantsomekandy',
//   redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
//   response_types: ['code'],
//   token_endpoint_auth_method: 'client_secret_basic'
// };

export const OIDC_CLIENT_METADATA: ClientMetadata = {
  client_id: 'oidc-client-test',
  client_secret: 'itellyouhwhat',
  redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic'
};

export const OIDC_IDP_ISSUER_URL = 'http://localhost:4001/oidc';
// export const OIDC_IDP_ISSUER_URL = 'https://idp-dev.geoservices.tamu.edu/';
// export const OIDC_IDP_ISSUER_URL = 'https://idp-dev-lb.geoservices.tamu.edu'
export const OIDC_CLIENT_PARAMS = {
  scope: 'openid offline_access basic_profile email tamu role',
  state: 'texas', // Opaque value set by the RP to maintain state between request and callback
  prompt: 'consent'
};
