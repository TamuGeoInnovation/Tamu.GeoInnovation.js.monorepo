import { Provider } from 'oidc-provider';

export interface OidcProvider extends Provider {
  setProviderSession(req, res, {});
}
