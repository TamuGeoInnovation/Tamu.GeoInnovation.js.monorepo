import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-monuments',
  templateUrl: './monuments.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionContentComponent]
})
export class MonumentsComponent {}
