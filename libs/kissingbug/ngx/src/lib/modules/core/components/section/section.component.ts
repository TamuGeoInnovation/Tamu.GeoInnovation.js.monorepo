import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { IStrapiPageSection } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageSection;

  constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
