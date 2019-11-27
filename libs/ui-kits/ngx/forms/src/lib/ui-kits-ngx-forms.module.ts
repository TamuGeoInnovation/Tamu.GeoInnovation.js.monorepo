import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectComponent } from './components/select/select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CheckboxGroupComponent } from './components/checkbox-group/checkbox-group.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [SelectComponent, CheckboxComponent, CheckboxGroupComponent],
  exports: [SelectComponent, CheckboxComponent, CheckboxGroupComponent]
})
export class UIFormsModule {}
