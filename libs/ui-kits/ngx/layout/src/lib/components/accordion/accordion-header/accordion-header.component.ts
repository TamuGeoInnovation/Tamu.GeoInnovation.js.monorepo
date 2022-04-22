import { Component, HostListener } from '@angular/core';

import { AccordionService } from '../services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss']
})
export class AccordionHeaderComponent {
  public state = this.comm.state;

  @HostListener('click', ['$event'])
  private _onClick() {
    this.comm.toggle('expanded');
  }

  constructor(private comm: AccordionService) {}
}
