import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.scss'],
  imports: [RouterOutlet]
})
export class CompetitionsComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`Competitions | ${inject(GISDAY_SITE).name}`);
  }
}
