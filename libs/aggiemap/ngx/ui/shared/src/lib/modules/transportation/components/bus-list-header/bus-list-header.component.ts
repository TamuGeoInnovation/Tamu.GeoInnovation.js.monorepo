import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AccordionHeaderComponent, AccordionService } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-bus-list-header',
  templateUrl: './bus-list-header.component.html',
  styleUrls: ['./bus-list-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class BusListHeaderComponent extends AccordionHeaderComponent {
  private c: AccordionService;

  constructor() {
    const c = inject(AccordionService);

    super(c);

    this.c = c;
  }
}
