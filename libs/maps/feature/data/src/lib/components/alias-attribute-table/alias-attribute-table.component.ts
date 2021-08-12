import { Component, Input } from '@angular/core';

import { AttributeTableComponent } from '../attribute-table/attribute-table.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-alias-attribute-table',
  templateUrl: './alias-attribute-table.component.html',
  styleUrls: ['./alias-attribute-table.component.scss']
})
export class AliasAttributeTableComponent extends AttributeTableComponent {
  @Input()
  public fields: Array<esri.Field>;
}
