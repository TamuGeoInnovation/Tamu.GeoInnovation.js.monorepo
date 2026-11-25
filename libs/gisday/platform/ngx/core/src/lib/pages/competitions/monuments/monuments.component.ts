import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-monuments',
  templateUrl: './monuments.component.html',
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionContentComponent, RouterLink]
})
export class MonumentsComponent {}
