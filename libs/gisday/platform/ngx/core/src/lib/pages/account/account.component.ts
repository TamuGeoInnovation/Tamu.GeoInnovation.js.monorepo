import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE, SiteHasPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SiteHasPipe, RouterLinkActive, RouterLink, RouterOutlet]
})
export class AccountComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`Account | ${inject(GISDAY_SITE).name}`);
  }
}
