import { Component, HostListener } from '@angular/core';

import { AccordionService } from '../services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss'],
  standalone: false
})
export class AccordionHeaderComponent {
  public state = this.comm.state;

  @HostListener('click')
  protected _onClick() {
    this.comm.toggle('expanded');
  }

  constructor(private comm: AccordionService) {}
}
