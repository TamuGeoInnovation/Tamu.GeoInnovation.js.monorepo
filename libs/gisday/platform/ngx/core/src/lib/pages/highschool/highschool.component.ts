import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-highschool',
  templateUrl: './highschool.component.html',
  styleUrls: ['./highschool.component.scss']
})
export class HighschoolComponent {
  private titleService = inject(Title);

  constructor() {
    // In the constructor, as every other page that sets its title does: `inject()` in ngOnInit threw NG0203 and left
    // the header half drawn (#3889).
    this.titleService.setTitle(`High School | ${inject(GISDAY_SITE).name}`);
  }
}
