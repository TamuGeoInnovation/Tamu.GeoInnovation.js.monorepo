import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DlDateTimePickerDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AbstractValueAccessorFormComponent } from './models/abstract-value-accessor-form/abstract-value-accessor-form.component';

import { SelectComponent } from './components/select/select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CheckboxGroupComponent } from './components/checkbox-group/checkbox-group.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { TextboxComponent } from './components/textbox/textbox.component';
import { ButtonComponent } from './components/button/button.component';
import { RangeComponent } from './components/range/range.component';
import { FileComponent } from './components/file/file.component';
import { RadioGroupComponent } from './components/radio-group/radio-group.component';
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';

@NgModule({
  imports: [CommonModule, FormsModule, UILayoutModule, DlDateTimePickerDateModule, DlDateTimePickerModule],
  declarations: [
    SelectComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    DateTimePickerComponent,
    TextboxComponent,
    AbstractValueAccessorFormComponent,
    ButtonComponent,
    FileComponent,
    RadioGroupComponent,
    RangeComponent,
    SlideToggleComponent
  ],
  exports: [
    SelectComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    DateTimePickerComponent,
    TextboxComponent,
    ButtonComponent,
    FileComponent,
    RadioGroupComponent,
    RangeComponent,
    SlideToggleComponent
  ]
})
export class UIFormsModule {}
