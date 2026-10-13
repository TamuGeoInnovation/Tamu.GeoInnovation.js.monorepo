import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

/**
 * The switch between a development host's two faces, on every page (#1722).
 *
 * - As dev, it offers "View as production": one click, from any map, to see what a visitor to
 *   production will get.
 * - Acting as production, it says so and offers the way back. `?as=production` turns development
 *   features off for the whole tab, and nothing else on the page would say why they are missing.
 *
 * Lives in the application shell, like the Code Maroon alert, so it covers every map and page.
 * Renders nothing on production: the switch does nothing there, so there is nothing to offer.
 */
@Component({
  selector: 'tamu-gisc-acting-as-production',
  templateUrl: './acting-as-production.component.html',
  styleUrls: ['./acting-as-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActingAsProductionComponent {
  private readonly ts = inject(TestingService);

  /** A development host behaving as itself. */
  public readonly development = this.ts.isTesting;

  /** A development host asked to behave as production. */
  public readonly production = this.ts.actingAsProduction;

  /**
   * This page again, the other way. Loads it, not routes to it: what the switch decides is settled
   * when the page loads. The address is read at the click, because the shell outlives every
   * navigation and the page it was created on is rarely the one being looked at.
   */
  public view(as: 'production' | 'development', event: Event): void {
    event.preventDefault();
    window.location.assign(`${window.location.pathname}?as=${as}`);
  }
}
