import { Component, OnInit, HostListener, Input } from '@angular/core';
import { IAccordionModel } from '../accordion.component';

import { AccordionService } from '../services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss']
})
export class AccordionHeaderComponent implements OnInit {
  @Input()
  public model: IAccordionModel = {
    animate: false,
    expanded: false,
    resize: false
  };

  public expanded = this.comm.expanded;

  @HostListener('click', ['$event'])
  private _onClick() {
    this.comm.toggle();
  }

  constructor(private comm: AccordionService) {}

  public ngOnInit() {}
}
