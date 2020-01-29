export const environment = {
  production: false
};

export const OIDC_CLIENT_METADATA = {
  CLIENT_ID: 'gisday',
  CLIENT_SECRET: 'D\'WUUUAAAAAAAAAAAAAAHHHHHHHHHHHHHHHH!!!!!!!!!',
  redirect_uris: ['http://localhost:3000/oidc/auth/callback'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic',
}

export const OIDC_IDP_ISSUER_URL = "http://localhost:4001"