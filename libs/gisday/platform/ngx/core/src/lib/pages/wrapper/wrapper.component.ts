import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { HeaderComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FooterComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderComponent, RouterOutlet, RouterLink, AsyncPipe, FooterComponent]
})
export class WrapperComponent {
  /** Its name and contact address, as each GIS Day site has its own (#2077). */
  public readonly site = inject(GISDAY_SITE);

  private readonly seasons = inject(SeasonService);

  // On a past year's pages, a banner says which year is shown and links back to this year (#1758).
  public viewedYear$ = this.seasons.viewedYear$;
  public viewedSeason$ = this.seasons.viewedSeason$;
  public isPastSeason$ = this.seasons.isPastSeason$;
}
