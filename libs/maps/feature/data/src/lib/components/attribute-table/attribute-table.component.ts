import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

@Component({
  selector: 'tamu-gisc-attribute-table',
  templateUrl: './attribute-table.component.html',
  styleUrls: ['./attribute-table.component.scss'],
  imports: [KeyValuePipe, JsonPipe]
})
export class AttributeTableComponent {
  public readonly data = input<IGraphic['attributes']>(undefined);

  /**
   * Function used to initially sort data. Passed in directly to the ngFor directive
   * responsible for iterating through all the properties.
   */
  public readonly sortFn = input<() => boolean>(undefined);
}
