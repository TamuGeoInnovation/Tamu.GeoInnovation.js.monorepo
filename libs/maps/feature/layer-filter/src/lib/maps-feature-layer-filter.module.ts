import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  SelectComponent,
  CheckboxComponent,
  CheckboxGroupComponent,
  DateTimePickerComponent,
  TextboxComponent,
  AutocompleteComponent,
  AutocompleteOptionTemplateDirective,
  ButtonComponent,
  FileComponent,
  RadioGroupComponent,
  RangeComponent,
  SlideToggleComponent,
  SelectListComponent,
  TurnstileChallengeComponent
} from '@tamu-gisc/ui-kits/ngx/forms';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';

import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';

@NgModule({
  imports: [
    CommonModule,
    SelectComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    DateTimePickerComponent,
    TextboxComponent,
    AutocompleteComponent,
    AutocompleteOptionTemplateDirective,
    ButtonComponent,
    FileComponent,
    RadioGroupComponent,
    RangeComponent,
    SlideToggleComponent,
    SelectListComponent,
    TurnstileChallengeComponent,
    FeatureSelectorModule
  ],
  declarations: [LayerFilterComponent],
  exports: [LayerFilterComponent]
})
export class LayerFilterModule {}
