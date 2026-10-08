import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CensusIntersectionBasicComponent } from '../../basic/census-intersection-basic/census-intersection-basic.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InteractiveModeToggleComponent } from '../../../common/interactive-mode-toggle/interactive-mode-toggle.component';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { StatusResultTableComponent } from '../../../../../result-tables/components/common/status-result-table/status-result-table.component';
import { CensusIntersectionResultTableComponent } from '../../../../../result-tables/components/census-intersection/census-intersection-result-table/census-intersection-result-table.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-census-intersection-advanced',
  templateUrl: './census-intersection-advanced.component.html',
  styleUrls: ['./census-intersection-advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InteractiveModeToggleComponent,
    TextboxComponent,
    SelectComponent,
    CheckboxGroupComponent,
    CheckboxComponent,
    ButtonComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    StatusResultTableComponent,
    CensusIntersectionResultTableComponent,
    AsyncPipe
  ]
})
export class CensusIntersectionAdvancedComponent extends CensusIntersectionBasicComponent {}
