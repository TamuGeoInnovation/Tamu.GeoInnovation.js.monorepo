import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccordionComponent } from './components/accordion/accordion.component';
import { AccordionTitleComponent } from './components/accordion/accordion-title/accordion-title.component';
import { AccordionContentComponent } from './components/accordion/accordion-content/accordion-content.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { TooltipTriggerComponent } from './components/tooltip-trigger/tooltip-trigger.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AccordionComponent,
    AccordionTitleComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent
  ],
  exports: [
    AccordionComponent,
    AccordionTitleComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent
  ]
})
export class UILayoutModule {}
