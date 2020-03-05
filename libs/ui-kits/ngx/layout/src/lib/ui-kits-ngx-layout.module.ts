import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Abstract Components
import { AbstractSlidingDrawerComponent } from './abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';
import { AbstractContentReplacerComponent } from './abstracts/abstract-content-swap/abstract-content-replacer.component';
import { AbstractContentReplacerToggleComponent } from './abstracts/abstract-content-swap/abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';

// Export Components
import { AccordionComponent } from './components/accordion/accordion.component';
import { AccordionHeaderComponent } from './components/accordion/accordion-header/accordion-header.component';
import { AccordionContentComponent } from './components/accordion/accordion-content/accordion-content.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { TooltipTriggerComponent } from './components/tooltip-trigger/tooltip-trigger.component';
import { DrawerComponent } from './components/drawer/drawer.component';

import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tabs/tab/tab.component';
import { AccordionDirective } from './components/accordion/directives/accordion.directive';
import { AccordionHeaderDirective } from './components/accordion/directives/accordion-header.directive';
import { AccordionContentDirective } from './components/accordion/directives/accordion-content.directive';
import { StepperComponent } from './components/stepper/stepper.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AbstractSlidingDrawerComponent,
    AbstractContentReplacerComponent,
    AbstractContentReplacerToggleComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    DrawerComponent,
    TabsComponent,
    TabComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective,
    StepperComponent
  ],
  exports: [
    DrawerComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TabsComponent,
    TabComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective
  ]
})
export class UILayoutModule {}
