# How to setup defaults

The `oidc-provider-nest` app will now use values in `secrets.ts` to insert default client and default admin user. The `secrets.ts` file must have the following properties:

```
export const ADMIN_DEFAULTS = {
  client_id: 'CLIENT_ID_GOES_HERE',
  redirect_uris: ['http://localhost:4200/auth/callback'],
  token_endpoint_auth_method: 'none',
  post_logout_redirect_uris: ['http://localhost:4200'],
  email: 'EMAIL@GMAIL.COM', // Default admin email
  password: 'ABC123' // Default admin password
};

```
