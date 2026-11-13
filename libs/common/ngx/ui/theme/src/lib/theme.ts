/**
 * What a visitor chose: follow the sun (and the device), or always one or the other.
 */
export type ThemePreference = 'auto' | 'dark' | 'light';

/**
 * What the page is drawn in.
 */
export type Theme = 'dark' | 'light';

export const THEME_PREFERENCES: ReadonlyArray<{ value: ThemePreference; label: string; icon: string }> = [
  { value: 'auto', label: 'Automatic', icon: 'brightness_auto' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'light', label: 'Light', icon: 'light_mode' }
];

export interface ThemeInputs {
  preference: ThemePreference;
  /** The sun is below the horizon where the map is (College Station). */
  sunDown: boolean;
  /** The device asks for dark (`prefers-color-scheme: dark`), as phones do on a dark-mode schedule of their own. */
  systemPrefersDark: boolean;
  /** Dark mode is offered here at all. Off on production until it is approved, so the page stays light there. */
  enabled: boolean;
}

/**
 * The theme for a preference and the state of the world. Automatic is dark at night, or whenever the device itself is
 * in dark mode: someone whose phone is dark all day asked for that. Dark and Light override both.
 */
export function resolveTheme({ preference, sunDown, systemPrefersDark, enabled }: ThemeInputs): Theme {
  if (!enabled) {
    return 'light';
  }

  if (preference !== 'auto') {
    return preference;
  }

  return sunDown || systemPrefersDark ? 'dark' : 'light';
}

/**
 * A stored value read back as a preference. Anything else, missing or written by an older version, is Automatic.
 */
export function asThemePreference(value: unknown): ThemePreference {
  return value === 'dark' || value === 'light' || value === 'auto' ? value : 'auto';
}
