import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE, SiteHasPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SiteHasPipe, RouterLinkActive, RouterLink, RouterOutlet]
})
export class AdminComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`Admin | ${inject(GISDAY_SITE).name}`);
  }
}
