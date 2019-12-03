import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DlDateTimePickerDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';

import { SelectComponent } from './components/select/select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CheckboxGroupComponent } from './components/checkbox-group/checkbox-group.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

@NgModule({
  imports: [CommonModule, FormsModule, UILayoutModule, DlDateTimePickerDateModule, DlDateTimePickerModule],
  declarations: [SelectComponent, CheckboxComponent, CheckboxGroupComponent, DateTimePickerComponent],
  exports: [SelectComponent, CheckboxComponent, CheckboxGroupComponent, DateTimePickerComponent]
})
export class UIFormsModule {}
