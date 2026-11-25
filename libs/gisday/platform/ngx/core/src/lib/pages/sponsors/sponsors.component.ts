import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
  imports: [RouterOutlet]
})
export class SponsorsComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`Sponsors | ${inject(GISDAY_SITE).name}`);
  }
}
