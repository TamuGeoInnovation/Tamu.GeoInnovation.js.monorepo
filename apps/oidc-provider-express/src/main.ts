import { IdpServer } from '@tamu-gisc/oidc/provider';

import { clients, keys, provider_config } from './environments/environment';

const server = new IdpServer({
  issuer: 'http://localhost:4001',
  provider: provider_config,
  clients: clients,
  keys: keys
}).start();
