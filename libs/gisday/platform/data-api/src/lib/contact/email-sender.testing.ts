import { Provider } from '@nestjs/common';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { EmailSenderService } from './email-sender.service';

/**
 * The real "Send as" check (#3100), for the tests of a controller whose send routes take a sender: the admin's own address
 * comes only from their token's claims, as when Auth0 management is off (locally, #1759).
 */
export const EMAIL_SENDER_TEST_PROVIDERS: Array<Provider> = [
  EmailSenderService,
  {
    provide: ManagementService,
    useValue: { getUserMetadata: () => Promise.reject(new Error('Auth0 management is not configured in tests.')) }
  }
];
