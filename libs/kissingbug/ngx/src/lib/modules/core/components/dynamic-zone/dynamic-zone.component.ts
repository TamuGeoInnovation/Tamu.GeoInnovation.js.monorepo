import { Component, Input } from '@angular/core';

import { IStrapiComponent } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-dynamic-zone',
  templateUrl: './dynamic-zone.component.html',
  styleUrls: ['./dynamic-zone.component.scss']
})
export class DynamicZoneComponent {
  @Input()
  public dataSource: IStrapiComponent;
}
