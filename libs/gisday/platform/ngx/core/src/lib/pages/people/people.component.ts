import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, RouterLink]
})
export class PeopleComponent {
  /** Its name and contact address, as each GIS Day site has its own (#2077). */
  public readonly site = inject(GISDAY_SITE);

  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`People | ${inject(GISDAY_SITE).name}`);
  }
}
