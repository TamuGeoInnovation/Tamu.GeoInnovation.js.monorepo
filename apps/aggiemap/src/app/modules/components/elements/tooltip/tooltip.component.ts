import { Component, OnInit, Input, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'gisc-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  @Input()
  public width: number;

  @Input()
  public height: number;

  @Input()
  public position: string;

  @Input()
  public isVisible: boolean;

  @Output()
  public outsideClick: EventEmitter<boolean> = new EventEmitter();

  /**
   * Detects if interaction clicks are within the component. If outside, emit an event telling the parent
   * it has been defocused.
   *
   * @param {*} event
   * @memberof TooltipComponent
   */
  @HostListener('document:mousedown', ['$event'])
  public clickOutside(event) {
    if (this.isVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.outsideClick.emit(true);
    }
  }

  constructor(private elementRef: ElementRef) {}

  public ngOnInit() {}
}
