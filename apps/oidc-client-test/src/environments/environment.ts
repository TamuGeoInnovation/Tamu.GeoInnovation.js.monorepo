import { ClientMetadata } from 'openid-client';

export const environment = {
  production: false
};

export const OIDC_CLIENT_METADATA: ClientMetadata = {
  client_id: 'gisday',
  client_secret: 'D\'WUUUAAAAAAAAAAAAAAHHHHHHHHHHHHHHHH!!!!!!!!!',
  redirect_uris: ['http://localhost:3000/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic',
}

export const OIDC_IDP_ISSUER_URL = "http://localhost:4001"

export const OIDC_CLIENT_PARAMS = {
  scope: 'openid offline_access basic_profile email tamu roles',
  state: 'texas', // Opaque value set by the RP to maintain state between request and callback
  prompt: 'consent'
};
