import { asThemePreference, resolveTheme, ThemeInputs } from './theme';

const day: ThemeInputs = { preference: 'auto', sunDown: false, systemPrefersDark: false, enabled: true };

describe('resolveTheme', () => {
  it('is light by day and dark by night on Automatic', () => {
    expect(resolveTheme(day)).toBe('light');
    expect(resolveTheme({ ...day, sunDown: true })).toBe('dark');
  });

  it('is dark by day on Automatic when the device is in dark mode', () => {
    expect(resolveTheme({ ...day, systemPrefersDark: true })).toBe('dark');
  });

  it('keeps Light at night and with a dark device: the visitor turned it off', () => {
    expect(resolveTheme({ ...day, preference: 'light', sunDown: true, systemPrefersDark: true })).toBe('light');
  });

  it('keeps Dark by day', () => {
    expect(resolveTheme({ ...day, preference: 'dark' })).toBe('dark');
  });

  it('is always light where dark mode is not offered, whatever was chosen', () => {
    expect(resolveTheme({ ...day, enabled: false, preference: 'dark', sunDown: true, systemPrefersDark: true })).toBe(
      'light'
    );
  });
});

describe('asThemePreference', () => {
  it('reads back what was stored', () => {
    expect(asThemePreference('dark')).toBe('dark');
    expect(asThemePreference('light')).toBe('light');
    expect(asThemePreference('auto')).toBe('auto');
  });

  it('treats nothing stored, or anything unknown, as Automatic', () => {
    expect(asThemePreference(undefined)).toBe('auto');
    expect(asThemePreference('sepia')).toBe('auto');
    expect(asThemePreference(1)).toBe('auto');
  });
});
