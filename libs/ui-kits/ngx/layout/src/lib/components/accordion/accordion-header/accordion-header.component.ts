import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { AccordionService } from '../services/accordion.service';
import { AbstractSlidingDrawerComponent } from '../../../abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-accordion-header',
    templateUrl: './accordion-header.component.html',
    styleUrls: ['./accordion-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AbstractSlidingDrawerComponent, AsyncPipe]
})
export class AccordionHeaderComponent {
  public state = this.comm.state;

  @HostListener('click')
  protected _onClick() {
    this.comm.toggle('expanded');
  }

  constructor(private comm: AccordionService) {}
}
