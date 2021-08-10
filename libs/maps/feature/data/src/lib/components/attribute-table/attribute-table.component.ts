import { Component, Input, OnInit } from '@angular/core';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

@Component({
  selector: 'tamu-gisc-attribute-table',
  templateUrl: './attribute-table.component.html',
  styleUrls: ['./attribute-table.component.scss']
})
export class AttributeTableComponent {
  @Input()
  public data: IGraphic['attributes'];

  /**
   * Function used to initially sort data. Passed in directly to the ngFor directive
   * responsible for iterating through all the properties.
   */
  @Input()
  public sortFn: () => boolean;
}
