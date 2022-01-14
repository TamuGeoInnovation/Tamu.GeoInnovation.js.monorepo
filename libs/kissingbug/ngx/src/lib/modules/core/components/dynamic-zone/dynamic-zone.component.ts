import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { IStrapiComponent } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-dynamic-zone',
  templateUrl: './dynamic-zone.component.html',
  styleUrls: ['./dynamic-zone.component.scss']
})
export class DynamicZoneComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiComponent;

  constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
