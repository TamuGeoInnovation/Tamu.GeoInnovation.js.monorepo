import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { AttributeTableComponent } from '../attribute-table/attribute-table.component';
import { AttributeFieldPipe } from './pipes/attribute-field/attribute-field.pipe';
import { FieldCodedValuePipe } from './pipes/field-coded-value/field-coded-value.pipe';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-alias-attribute-table',
  templateUrl: './alias-attribute-table.component.html',
  styleUrls: ['./alias-attribute-table.component.scss'],
  imports: [KeyValuePipe, AttributeFieldPipe, FieldCodedValuePipe]
})
export class AliasAttributeTableComponent extends AttributeTableComponent {
  public readonly fields = input<Array<esri.Field>>(undefined);
}
