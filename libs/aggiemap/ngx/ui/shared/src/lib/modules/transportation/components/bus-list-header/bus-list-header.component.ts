import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccordionHeaderComponent, AccordionService } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-bus-list-header',
  templateUrl: './bus-list-header.component.html',
  styleUrls: ['./bus-list-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BusListHeaderComponent extends AccordionHeaderComponent {
  constructor(private c: AccordionService) {
    super(c);
  }
}
