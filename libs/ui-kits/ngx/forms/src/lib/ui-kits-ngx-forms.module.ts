import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectComponent } from './components/select/select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [SelectComponent, CheckboxComponent],
  exports: [SelectComponent, CheckboxComponent]
})
export class UIFormsModule {}
