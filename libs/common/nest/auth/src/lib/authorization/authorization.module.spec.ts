import { AuthorizationModule } from './authorization.module';

/**
 * #1794: with `LOGGING` set, `forRoot` logged its whole configuration, and with it the Auth0 management client secret,
 * into the log of every API started that way. Made-up values only.
 */
describe('AuthorizationModule.forRoot (#1794)', () => {
  const config = {
    jwt: { audience: 'https://made-up.example/api', issuerUrl: 'https://made-up.example/' },
    management: { domain: 'made-up.example', clientId: 'made-up-client-id', clientSecret: 'made-up-secret-do-not-log' }
  };

  let logged: string;
  let spy: ReturnType<typeof vi.spyOn>;
  const before = process.env.LOGGING;

  beforeEach(() => {
    logged = '';
    spy = vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => {
      logged += JSON.stringify(args);
    });
    process.env.LOGGING = 'true';
  });

  afterEach(() => {
    spy.mockRestore();

    if (before === undefined) {
      delete process.env.LOGGING;
    } else {
      process.env.LOGGING = before;
    }
  });

  it('never logs the management client secret', () => {
    AuthorizationModule.forRoot(config);

    expect(logged).not.toContain('made-up-secret-do-not-log');
  });

  it('still logs what is not secret, and whether a secret was given', () => {
    AuthorizationModule.forRoot(config);

    expect(logged).toContain('made-up.example');
    expect(logged).toContain('https://made-up.example/api');
    expect(logged).toMatch(/clientSecret.{0,4}set/);
  });

  it('logs nothing without LOGGING', () => {
    delete process.env.LOGGING;
    AuthorizationModule.forRoot(config);

    expect(spy).not.toHaveBeenCalled();
  });
});
