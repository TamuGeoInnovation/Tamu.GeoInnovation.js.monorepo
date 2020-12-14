import { ClientMetadata } from 'openid-client';

export * from './lib/auth/session-serializer';
export * from './lib/auth/oidc-client.controller';
export * from './lib/auth/oidc-client.module';
export * from './lib/auth/open-id-client';

export * from './lib/guards/authenticated.guard';
export * from './lib/guards/login.guard';
export * from './lib/guards/roles.guard';

export * from './lib/middleware/claims.middleware';

export * from './lib/types/auth-types';

export interface ClientConfiguration {
  metadata: ClientMetadata;
  parameters: object;
  issuer_url: string;
}
