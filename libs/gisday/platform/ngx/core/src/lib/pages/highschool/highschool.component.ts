import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-highschool',
  templateUrl: './highschool.component.html',
  styleUrls: ['./highschool.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class HighschoolComponent implements OnInit {
  private titleService = inject(Title);

  public ngOnInit(): void {
    this.titleService.setTitle(`High School | ${inject(GISDAY_SITE).name}`);
  }
}
