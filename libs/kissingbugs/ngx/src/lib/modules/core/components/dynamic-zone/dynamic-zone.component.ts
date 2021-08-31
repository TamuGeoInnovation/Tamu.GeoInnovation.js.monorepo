import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiComponent } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-dynamic-zone',
  templateUrl: './dynamic-zone.component.html',
  styleUrls: ['./dynamic-zone.component.scss']
})
export class DynamicZoneComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiComponent;

  constructor() {}

  public ngOnInit() {
    console.log(this.dataSource);
  }

  public ngOnDestroy() {}
}
