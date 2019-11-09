import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccordionComponent } from './components/accordion/accordion.component';
import { AccordionTitleComponent } from './components/accordion/accordion-title/accordion-title.component';
import { AccordionContentComponent } from './components/accordion/accordion-content/accordion-content.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AccordionComponent, AccordionTitleComponent, AccordionContentComponent],
  exports: [AccordionComponent, AccordionTitleComponent, AccordionContentComponent]
})
export class UiKitsNgxLayoutModule {}
