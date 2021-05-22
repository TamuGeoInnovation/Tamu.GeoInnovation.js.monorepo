import { Component, ElementRef, Input, AfterContentInit } from '@angular/core';

import { AccordionService } from './services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  providers: [AccordionService]
})
export class AccordionComponent implements AfterContentInit {
  /**
   * Input boolean from the parent component that serves as a collapse/expand toggle
   * for the accordion.
   */
  @Input()
  public expanded = false;

  @Input()
  public resize = false;

  @Input()
  public animate = false;

  constructor(private el: ElementRef, private comm: AccordionService) {}

  public ngAfterContentInit() {
    this.comm.update({
      animate: this.animate,
      expanded: this.expanded,
      resize: this.resize
    });
  }
}
