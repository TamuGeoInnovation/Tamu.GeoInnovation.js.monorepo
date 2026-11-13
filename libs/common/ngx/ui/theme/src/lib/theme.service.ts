import { DOCUMENT, DestroyRef, Injectable, InjectionToken, computed, effect, inject, signal } from '@angular/core';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { COLLEGE_STATION, isSunDown, nextSunChange } from '@tamu-gisc/common/utils/geometry';

import { Theme, ThemePreference, asThemePreference, resolveTheme } from './theme';

/**
 * The clock the theme reads the sun by. A token so a test can set the time of day.
 */
export const THEME_CLOCK = new InjectionToken<() => Date>('THEME_CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date()
});

/**
 * Where night is decided. College Station's main campus: every AggieMap visitor is on Central time, and a satellite
 * campus a few hundred kilometres away changes over within minutes of it.
 */
export const THEME_LOCATION = new InjectionToken<{ latitude: number; longitude: number }>('THEME_LOCATION', {
  providedIn: 'root',
  factory: () => COLLEGE_STATION
});

/**
 * Whether dark mode is offered. Development hosts only until the maintainer approves it, so `?as=production` and
 * production itself stay light and show no control.
 */
export const THEME_ENABLED = new InjectionToken<boolean>('THEME_ENABLED', {
  providedIn: 'root',
  factory: () => inject(TestingService).isTesting
});

/** How often the sun is looked at again while the page is open. The change lands within this of sunset. */
export const THEME_RECHECK_MS = 60000;

/**
 * Stored in the `user-preferences` record as a branch of its own, `appearance: { theme }`. Every top-level key there
 * must be an object: SettingsService reads them all as settings branches and throws on a bare value.
 */
const STORAGE = { primaryKey: 'user-preferences', subKey: 'appearance' } as const;

/** The status bar colour on phones, light and dark: the support black it has always been, and the night surface. */
const STATUS_BAR: Record<Theme, string> = { light: '#332c2c', dark: '#1d232c' };

/**
 * Light or dark, for the whole page: sets `data-theme` on `<html>`, which the custom properties in
 * `libs/sass/_theme.scss` key on, and Esri's widget theme and Calcite's mode to match.
 *
 * Inject it once, early (AggieMap's root component does), so the page is the right colour before the map draws.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly store = inject(LocalStoreService);
  private readonly document = inject(DOCUMENT);
  private readonly clock = inject(THEME_CLOCK);
  private readonly location = inject(THEME_LOCATION);

  /** Dark mode is offered here. The controls show only where it is. */
  public readonly enabled = inject(THEME_ENABLED);

  private readonly _preference = signal<ThemePreference>(this.readPreference());
  public readonly preference = this._preference.asReadonly();

  private readonly now = signal<Date>(this.clock());
  private readonly systemPrefersDark = signal<boolean>(false);

  public readonly sunDown = computed(() => isSunDown(this.now(), this.location.latitude, this.location.longitude));

  public readonly theme = computed<Theme>(() =>
    resolveTheme({
      preference: this._preference(),
      sunDown: this.sunDown(),
      systemPrefersDark: this.systemPrefersDark(),
      enabled: this.enabled
    })
  );

  /** The next sunrise or sunset, for "Dark until 6:59 AM". */
  public readonly nextChange = computed(() => nextSunChange(this.now(), this.location.latitude, this.location.longitude));

  constructor() {
    const view = this.document.defaultView;
    const destroyRef = inject(DestroyRef);

    const media = view?.matchMedia?.('(prefers-color-scheme: dark)');

    if (media) {
      this.systemPrefersDark.set(media.matches);

      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      media.addEventListener?.('change', onChange);
      destroyRef.onDestroy(() => media.removeEventListener?.('change', onChange));
    }

    if (view) {
      // A phone suspends timers in a tab that is not showing, so a tab opened at noon and looked at after dark would
      // still be light until the next tick. Becoming visible is a tick of its own.
      const recheck = () => this.recheck();
      const interval = view.setInterval(recheck, THEME_RECHECK_MS);
      this.document.addEventListener('visibilitychange', recheck);

      destroyRef.onDestroy(() => {
        view.clearInterval(interval);
        this.document.removeEventListener('visibilitychange', recheck);
      });
    }

    effect(() => this.apply(this.theme()));
  }

  public setPreference(preference: ThemePreference): void {
    this._preference.set(preference);

    this.store.setStorageObjectKeyValue({ ...STORAGE, value: { theme: preference } });
  }

  /** Looks at the clock again. Called every minute and when the page comes back into view. */
  public recheck(): void {
    this.now.set(this.clock());
  }

  private readPreference(): ThemePreference {
    try {
      return asThemePreference(this.store.getStorageObjectKeyValue<{ theme?: unknown }>({ ...STORAGE })?.theme);
    } catch {
      return 'auto';
    }
  }

  private apply(theme: Theme): void {
    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme);

    // Calcite's mode classes set its own colour variables on the element they are on and everything inside, so on
    // `<html>` they reach every Calcite component and Esri widget the page draws.
    root.classList.toggle('calcite-mode-dark', theme === 'dark');
    root.classList.toggle('calcite-mode-light', theme === 'light');

    root.style.colorScheme = theme;

    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', STATUS_BAR[theme]);
  }
}
