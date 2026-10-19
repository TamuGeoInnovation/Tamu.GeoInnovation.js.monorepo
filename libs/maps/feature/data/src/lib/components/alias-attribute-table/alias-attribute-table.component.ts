import { Component, input } from '@angular/core';

import { AttributeTableComponent } from '../attribute-table/attribute-table.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-alias-attribute-table',
  templateUrl: './alias-attribute-table.component.html',
  styleUrls: ['./alias-attribute-table.component.scss']
})
export class AliasAttributeTableComponent extends AttributeTableComponent {
  public readonly fields = input<Array<esri.Field>>(undefined);
}
