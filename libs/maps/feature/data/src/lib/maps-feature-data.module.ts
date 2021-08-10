import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttributeTableComponent } from './components/attribute-table/attribute-table.component';
import { AliasAttributeTableComponent } from './components/alias-attribute-table/alias-attribute-table.component';
import { AttributeFieldPipe } from './components/alias-attribute-table/pipes/attribute-field/attribute-field.pipe';
import { FieldCodedValuePipe } from './components/alias-attribute-table/pipes/field-coded-value/field-coded-value.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [AttributeTableComponent, AliasAttributeTableComponent, AttributeFieldPipe, FieldCodedValuePipe],
  exports: [AttributeTableComponent, AliasAttributeTableComponent]
})
export class MapsFeatureDataModule {}
