import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ReverseGeocodingBasicComponent } from '../../basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { StatusResultTableComponent } from '../../../../../result-tables/components/common/status-result-table/status-result-table.component';
import { ReverseGeocodingResultTableComponent } from '../../../../../result-tables/components/reverse-geocoding/reverse-geocoding-result-table/reverse-geocoding-result-table.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-advanced',
  templateUrl: './reverse-geocoding-advanced.component.html',
  styleUrls: ['./reverse-geocoding-advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    SelectComponent,
    ButtonComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    StatusResultTableComponent,
    ReverseGeocodingResultTableComponent,
    AsyncPipe
  ]
})
export class ReverseGeocodingAdvancedComponent extends ReverseGeocodingBasicComponent {}
