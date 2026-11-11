import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { RadioGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { THEME_PREFERENCES, ThemePreference } from '../theme';
import { ThemeService } from '../theme.service';

/**
 * Automatic, Dark or Light, and when Automatic changes next. Shows nothing where dark mode is not offered, so it can be
 * placed anywhere without a gate of its own.
 */
@Component({
  selector: 'tamu-gisc-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RadioGroupComponent]
})
export class ThemePickerComponent {
  public readonly theme = inject(ThemeService);

  public readonly options = THEME_PREFERENCES;

  /**
   * "Dark until 6:41 AM" on Automatic. In Central time whatever zone the device is in: it is College Station's sun.
   */
  public readonly status = computed(() => {
    const next = this.theme.nextChange();

    if (this.theme.preference() !== 'auto' || !next) {
      return undefined;
    }

    const time = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
    const now = this.theme.theme() === 'dark' ? 'Dark' : 'Light';

    return this.theme.sunDown() ? `${now} now. Light from sunrise at ${time}.` : `${now} now. Dark from sunset at ${time}.`;
  });

  public choose(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }
}
