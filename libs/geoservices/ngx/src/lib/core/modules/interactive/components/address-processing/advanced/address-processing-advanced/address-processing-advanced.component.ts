import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AddressProcessingBasicComponent } from '../../basic/address-processing-basic/address-processing-basic.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InteractiveModeToggleComponent } from '../../../common/interactive-mode-toggle/interactive-mode-toggle.component';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { RouterLink } from '@angular/router';
import { CheckboxGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { StatusResultTableComponent } from '../../../../../result-tables/components/common/status-result-table/status-result-table.component';
import { ParsedAddressResultTableComponent } from '../../../../../result-tables/components/address-processing/parsed-address-result-table/parsed-address-result-table.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-address-processing-advanced',
  templateUrl: './address-processing-advanced.component.html',
  styleUrls: ['./address-processing-advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InteractiveModeToggleComponent,
    TextboxComponent,
    SelectComponent,
    RouterLink,
    CheckboxGroupComponent,
    CheckboxComponent,
    ButtonComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    StatusResultTableComponent,
    ParsedAddressResultTableComponent,
    AsyncPipe
  ]
})
export class AddressProcessingAdvancedComponent extends AddressProcessingBasicComponent {}
