import { OidcClientController } from './oidc-client.controller';
import { OpenIdClient } from './open-id-client';

// Passport's own request methods (logIn, logOut and the rest), so the test logs out the way the app does.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const passportRequest = require('passport/lib/http/request');

describe('OidcClientController', () => {
  describe('logout (#1978)', () => {
    const endSessionUrl = 'https://idp.example/session/end?client_id=ues';

    beforeEach(() => {
      OpenIdClient.client = { endSessionUrl: () => endSessionUrl } as unknown as typeof OpenIdClient.client;
    });

    it("sends a signed-in user to the provider's end-session URL with their id token", async () => {
      const sessionLogOut = jest.fn((req, options, done) => done());
      const req = {
        ...passportRequest,
        user: { id_token: 'the-id-token' },
        _sessionManager: { logOut: sessionLogOut }
      };
      const res = { redirect: jest.fn() };

      await expect(new OidcClientController().logout(req, res)).resolves.not.toThrow();

      expect(sessionLogOut).toHaveBeenCalled();
      expect(req.user).toBeNull();
      expect(res.redirect).toHaveBeenCalledWith(`${endSessionUrl}&id_token_hint=the-id-token`);
    });
  });
});
