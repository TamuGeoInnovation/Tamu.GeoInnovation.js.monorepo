import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Abstract Components
import { AbstractSlidingDrawerComponent } from './models/abstract-sliding-drawer/abstract-sliding-drawer.component';

// Export Components
import { AccordionComponent } from './components/accordion/accordion.component';
import { AccordionHeaderComponent } from './components/accordion/accordion-header/accordion-header.component';
import { AccordionContentComponent } from './components/accordion/accordion-content/accordion-content.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { TooltipTriggerComponent } from './components/tooltip-trigger/tooltip-trigger.component';
import { DrawerComponent } from './components/drawer/drawer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    DrawerComponent,
    AbstractSlidingDrawerComponent
  ],
  exports: [
    DrawerComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent
  ]
})
export class UILayoutModule {}
