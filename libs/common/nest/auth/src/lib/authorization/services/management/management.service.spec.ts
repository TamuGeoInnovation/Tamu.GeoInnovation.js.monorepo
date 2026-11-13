import { ServiceUnavailableException } from '@nestjs/common';

import { ManagementService } from './management.service';

describe('ManagementService', () => {
  const credentials = { domain: 'tenant.example.com', clientId: 'client', clientSecret: 'secret' };

  describe('disabled, as the local API runs with no management credentials (#1759)', () => {
    let service: ManagementService;

    beforeEach(() => {
      service = new ManagementService({ domain: '', clientId: '', clientSecret: '', disabled: true });
    });

    it('starts', () => {
      expect(service).toBeDefined();
    });

    it('answers 503 when asked whether it can change users', () => {
      expect(() => service.assertAvailable()).toThrow(ServiceUnavailableException);
    });

    it('answers 503 for a user, not 500', async () => {
      await expect(service.getUserMetadata('auth0|1')).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('answers 503 for every user', async () => {
      await expect(service.getUsers()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('answers 503 for users by id', async () => {
      await expect(service.getUsersByIds(['auth0|1'])).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('answers 503 for the users made in a window, and for their count (#2892)', async () => {
      const from = new Date('2025-11-21T06:00:00Z');
      const to = new Date('2026-11-21T06:00:00Z');

      await expect(service.getUsersCreatedBetween(from, to)).rejects.toBeInstanceOf(ServiceUnavailableException);
      await expect(service.countUsersCreatedBetween(from, to)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('answers 503 for an update', async () => {
      await expect(
        service.updateUserMetadata('auth0|1', undefined, { app_metadata: '*', user_metadata: '*' })
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('not disabled', () => {
    it('still stops at startup when a credential is missing', () => {
      expect(() => new ManagementService({ ...credentials, clientSecret: '' })).toThrow(
        'Management service configuration is missing required parameters.'
      );
    });

    it('starts with every credential, and can change users', () => {
      const service = new ManagementService(credentials);

      expect(() => service.assertAvailable()).not.toThrow();
    });
  });
});
