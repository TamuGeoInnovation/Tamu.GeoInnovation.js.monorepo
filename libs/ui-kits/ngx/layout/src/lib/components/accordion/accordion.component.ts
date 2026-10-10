import { Component, ElementRef, Input, AfterContentInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { AccordionService } from './services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  providers: [AccordionService],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AccordionComponent implements AfterContentInit {
  private el = inject(ElementRef);
  private comm = inject(AccordionService);

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

  public ngAfterContentInit() {
    this.comm.update({
      animate: this.animate,
      expanded: this.expanded,
      resize: this.resize
    });
  }

  public toggle() {
    this.comm.update({
      animate: this.animate,
      expanded: !this.expanded,
      resize: this.resize
    });
  }
}
