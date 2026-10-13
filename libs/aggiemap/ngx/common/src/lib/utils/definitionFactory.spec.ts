import { factory } from './definitionFactory';

/**
 * Which GIS server a build's layers are drawn from (#1734).
 *
 * A dev build is compiled with `environment: 'dev'` and reads the development GIS server. Asked to
 * behave as production (`?as=production`, #1722), it must read production's instead: on the deployed
 * dev site the switch hid the development features and left every layer on the development server,
 * so the layers only production has stayed struck through as failed.
 *
 * `inforUrl` stands for all of them: it is built from the GIS host and nothing else.
 */
const hostOf = (environment: 'dev' | 'prod' | undefined) =>
  new URL(factory(environment ? { environment } : undefined).Connections.inforUrl).hostname;

describe('the GIS server a build draws from', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('is the development server for a dev build', () => {
    expect(hostOf('dev')).toBe('gis-dev.it.tamu.edu');
    expect(hostOf(undefined)).toBe('gis-dev.it.tamu.edu');
  });

  it('is production\'s for a production build', () => {
    expect(hostOf('prod')).toBe('gis.it.tamu.edu');
  });

  it('is production\'s for a dev build asked to behave as production', () => {
    // What `?as=production` leaves behind for the rest of the tab's session.
    sessionStorage.setItem('tamu-gisc-acting-as', 'production');

    expect(hostOf('dev')).toBe('gis.it.tamu.edu');
    expect(hostOf(undefined)).toBe('gis.it.tamu.edu');
  });

  it('is still production\'s for a production build, whatever the switch says', () => {
    sessionStorage.setItem('tamu-gisc-acting-as', 'production');

    expect(hostOf('prod')).toBe('gis.it.tamu.edu');
  });
});
