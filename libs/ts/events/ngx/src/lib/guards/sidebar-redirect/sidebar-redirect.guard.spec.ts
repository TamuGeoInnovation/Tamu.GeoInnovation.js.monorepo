import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { SidebarRedirectGuard } from './sidebar-redirect.guard';

describe('SidebarRedirectGuard', () => {
  let guard: SidebarRedirectGuard;
  let router: Router;
  let eventSettingsService: { eventConfiguration: jest.Mock };

  const snapshot = (queryParams: Record<string, string> = {}) =>
    ({
      pathFromRoot: [{ url: [] }, { url: [{ path: 'events' }] }, { url: [{ path: 'my-event' }] }, { url: [{ path: 'map' }] }],
      queryParams
    }) as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    eventSettingsService = { eventConfiguration: jest.fn().mockReturnValue(undefined) };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [SidebarRedirectGuard, { provide: EventSettingsService, useValue: eventSettingsService }]
    });

    guard = TestBed.inject(SidebarRedirectGuard);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  /**
   * This guard replaces an unconditional `redirectTo: 'd'`, so the default path has to keep
   * behaving exactly as that redirect did -- navigate into the sidebar shell and cancel the
   * current activation.
   */
  it('redirects into the sidebar shell by default', () => {
    const route = snapshot();

    expect(guard.canActivate(route)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/', 'events', 'my-event', 'map', 'd'], { queryParams: {} });
  });

  it('carries the query params across the redirect', () => {
    const route = snapshot({ lot: '43' });

    guard.canActivate(route);

    expect(router.navigate).toHaveBeenCalledWith(expect.anything(), { queryParams: { lot: '43' } });
  });

  /**
   * The whole point of the guard: for an event configured with `hideSidebar`, it must do nothing
   * at all. Navigating would mount the sidebar shell and its overlay buttons, which is what a
   * kiosk or satellite-campus map is trying to avoid.
   */
  it('does not navigate when the event hides the sidebar', () => {
    eventSettingsService.eventConfiguration.mockReturnValue({ configuration: { hideSidebar: true } });

    expect(guard.canActivate(snapshot())).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // `hideSidebar` is compared with `=== true`, so anything else -- including a missing
  // configuration or a truthy non-boolean -- has to fall through to the normal redirect.
  it.each([
    ['no configuration at all', undefined],
    ['a configuration with no hideSidebar', { configuration: {} }],
    ['hideSidebar explicitly false', { configuration: { hideSidebar: false } }]
  ])('still redirects with %s', (_label, configuration) => {
    eventSettingsService.eventConfiguration.mockReturnValue(configuration);

    expect(guard.canActivate(snapshot())).toBe(false);
    expect(router.navigate).toHaveBeenCalled();
  });
});
