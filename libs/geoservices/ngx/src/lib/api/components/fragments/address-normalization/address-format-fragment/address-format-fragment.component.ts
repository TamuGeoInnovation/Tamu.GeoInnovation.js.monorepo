import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-address-format-fragment',
  templateUrl: './address-format-fragment.component.html',
  styleUrls: ['./address-format-fragment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AccordionDirective, AccordionHeaderDirective, AccordionContentDirective]
})
export class AddressFormatFragmentComponent {}
