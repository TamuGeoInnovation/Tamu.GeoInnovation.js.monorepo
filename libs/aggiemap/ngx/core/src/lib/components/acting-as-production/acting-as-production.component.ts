import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

/**
 * Says that a development host is behaving as production (#1722).
 *
 * `?as=production` turns development features off for the whole tab, and nothing else on the page
 * would say so: a tab left that way looks like a dev site with its features missing. This sits over
 * every page while the switch is on, with the link that turns it off.
 *
 * Lives in the application shell, like the Code Maroon alert, so it covers every map. Renders nothing
 * unless the switch is on, and the switch does nothing on production.
 */
@Component({
  selector: 'tamu-gisc-acting-as-production',
  templateUrl: './acting-as-production.component.html',
  styleUrls: ['./acting-as-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActingAsProductionComponent {
  public readonly active = inject(TestingService).actingAsProduction;

  /**
   * This page again, as dev. A plain link, not a router link: what the switch decides is settled when
   * the page loads, so turning it off means loading the page.
   */
  public readonly backToDevelopment = `${window.location.pathname}?as=development`;
}
