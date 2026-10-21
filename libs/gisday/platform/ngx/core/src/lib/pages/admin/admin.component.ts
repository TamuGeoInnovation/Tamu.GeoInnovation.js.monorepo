import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { GISDAY_SITE, SiteHasPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { NavigationEnd, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SiteHasPipe, RouterLinkActive, RouterLink, RouterOutlet]
})
export class AdminComponent {
  private titleService = inject(Title);

  /** On a phone the admin menu opens from a button instead of sitting above every page (#1998). */
  public readonly isMobile = toSignal(inject(ResponsiveService).isMobile, { initialValue: false });
  public readonly menuOpen = signal(false);

  constructor() {
    this.titleService.setTitle(`Admin | ${inject(GISDAY_SITE).name}`);

    // Choosing a page from the menu closes it, so the page is what shows.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.menuOpen.set(false));
  }
}
