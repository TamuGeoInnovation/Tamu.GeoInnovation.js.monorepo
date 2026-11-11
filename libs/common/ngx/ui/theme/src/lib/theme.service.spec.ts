import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';

import { THEME_CLOCK, THEME_ENABLED, THEME_RECHECK_MS, ThemeService } from './theme.service';

// Published by the US Naval Observatory for College Station: sunset 17:37 CST on 1 November 2026.
const beforeSunset = new Date('2026-11-01T17:30:00-06:00');
const afterSunset = new Date('2026-11-01T17:45:00-06:00');

function setUp(options: { now?: Date; enabled?: boolean; stored?: unknown; systemDark?: boolean } = {}) {
  let now = options.now ?? beforeSunset;

  localStorage.clear();

  if (options.stored !== undefined) {
    localStorage.setItem('user-preferences', JSON.stringify({ appearance: { theme: options.stored } }));
  }

  // jsdom has no matchMedia, so the device's setting is defined here.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        matches: options.systemDark === true && query.includes('dark'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }) as unknown as MediaQueryList
  });

  TestBed.configureTestingModule({
    providers: [
      { provide: THEME_CLOCK, useValue: () => now },
      { provide: THEME_ENABLED, useValue: options.enabled ?? true }
    ]
  });

  const service = TestBed.inject(ThemeService);
  const root = TestBed.inject(DOCUMENT).documentElement;

  return {
    service,
    root,
    setNow: (date: Date) => (now = date)
  };
}

describe('ThemeService', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('starts on Automatic and light before sunset, with nothing stored', () => {
    const { service, root } = setUp();
    TestBed.tick();

    expect(service.preference()).toBe('auto');
    expect(service.theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('turns dark by itself at sunset while the page is open', () => {
    const { service, root, setNow } = setUp();
    TestBed.tick();

    setNow(afterSunset);
    vi.advanceTimersByTime(THEME_RECHECK_MS);
    TestBed.tick();

    expect(service.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.classList.contains('calcite-mode-dark')).toBe(true);
  });

  it('looks at the clock again when the page comes back into view', () => {
    const { service, setNow } = setUp();

    setNow(afterSunset);
    document.dispatchEvent(new Event('visibilitychange'));

    expect(service.theme()).toBe('dark');
  });

  it('keeps the choice between visits', () => {
    const first = setUp({ now: afterSunset });
    first.service.setPreference('light');
    expect(first.service.theme()).toBe('light');

    // A second visit: a fresh injector reading the same storage.
    const stored = JSON.parse(localStorage.getItem('user-preferences') as string);
    TestBed.resetTestingModule();
    const second = setUp({ now: afterSunset, stored: stored.appearance.theme });

    expect(second.service.preference()).toBe('light');
    expect(second.service.theme()).toBe('light');
  });

  it('keeps the rest of the stored preferences, the saved basemap included', () => {
    const { service } = setUp();
    localStorage.setItem('user-preferences', JSON.stringify({ settings: { basemap: 'nearmap_cs_basemap' } }));

    service.setPreference('dark');

    expect(JSON.parse(localStorage.getItem('user-preferences') as string)).toEqual({
      settings: { basemap: 'nearmap_cs_basemap' },
      appearance: { theme: 'dark' }
    });
  });

  it('stores the choice where SettingsService can still read every saved preference', async () => {
    // Saving the theme as a bare string beside the settings branches made SettingsService throw "Settings branch is
    // not simple" on the next load, and the phone's search bar, which initialises settings, never appeared.
    const { service } = setUp();
    service.setPreference('dark');

    const settings = TestBed.inject(SettingsService);
    const values = await firstValueFrom(
      settings.init({ storage: { subKey: 'modals' }, settings: { seen: { value: false, persistent: true } } })
    );

    expect(values).toEqual({ seen: false });
  });

  it('follows a device in dark mode on Automatic by day', () => {
    const { service } = setUp({ systemDark: true });

    expect(service.theme()).toBe('dark');
  });

  it('stays light where dark mode is not offered, even with Dark stored', () => {
    const { service, root } = setUp({ now: afterSunset, enabled: false, stored: 'dark' });
    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('gives the next change of sky: sunset by day, the next sunrise by night', () => {
    const { service, setNow } = setUp();

    const minutesFrom = (date: Date | null, expected: string) =>
      Math.abs((date as Date).getTime() - new Date(expected).getTime()) / 60000;

    expect(minutesFrom(service.nextChange(), '2026-11-01T17:37-06:00')).toBeLessThanOrEqual(1);

    setNow(afterSunset);
    service.recheck();

    // The next morning, a minute or so after the 1st's 06:40.
    expect(minutesFrom(service.nextChange(), '2026-11-02T06:41-06:00')).toBeLessThanOrEqual(1.5);
  });
});
