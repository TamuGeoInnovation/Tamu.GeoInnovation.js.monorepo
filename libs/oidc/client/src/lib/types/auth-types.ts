import { ClientMetadata } from 'openid-client';

// AuthOptions and AuthUrl live in @tamu-gisc/common/types (#2155); re-exported for this library's own callers.
export type { AuthOptions, AuthUrl } from '@tamu-gisc/common/types';

export interface ClientConfiguration {
  metadata: ClientMetadata;
  parameters: { [key: string]: string | boolean | number };
  issuer_url: string;
}
