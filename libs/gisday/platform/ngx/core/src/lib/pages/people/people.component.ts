import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet]
})
export class PeopleComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`People | ${inject(GISDAY_SITE).name}`);
  }
}
