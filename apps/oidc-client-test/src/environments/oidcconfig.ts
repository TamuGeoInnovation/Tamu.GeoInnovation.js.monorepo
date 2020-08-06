import { ClientMetadata } from 'openid-client';

export const OIDC_CLIENT_METADATA: ClientMetadata = {
  client_id: 'oidc-client-test-jwt',
  client_secret: 'pppssssssttttheykidwantsomekandy',
  redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_jwt'
};

export const OIDC_CLIENT_METADATA_AD: ClientMetadata = {
  client_id: 'b749fe37-b419-435d-b9e0-10aaf0d805cd',
  client_secret: 'xNp1t3cR~9E3KD_8ro~o2Fjuq.8rZTdGk.',
  redirect_uris: ['http://localhost:3001/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic'
};

export const OIDC_IDP_ISSUER_URL = 'http://localhost:4001/oidc';
export const AZURE_AD_UES = 'https://login.microsoftonline.com/9a4b2063-ef21-4cba-be50-c102f23dbebe/v2.0';
// export const OIDC_IDP_ISSUER_URL = 'https://idp-dev.geoservices.tamu.edu/';
// export const OIDC_IDP_ISSUER_URL = 'https://idp-dev-lb.geoservices.tamu.edu'
export const OIDC_CLIENT_PARAMS = {
  scope: 'openid offline_access basic_profile email role',
  state: 'texas',
  prompt: 'consent'
};

export const OIDC_CLIENT_PARAMS_AD = {
  scope: 'openid email profile',
  state: 'texas',
  prompt: 'consent'
};
