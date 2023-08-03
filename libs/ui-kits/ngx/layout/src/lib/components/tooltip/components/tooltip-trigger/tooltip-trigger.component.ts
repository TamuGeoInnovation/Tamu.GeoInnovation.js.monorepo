import { Component, HostListener, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tooltip-trigger',
  templateUrl: './tooltip-trigger.component.html',
  styleUrls: ['./tooltip-trigger.component.scss']
})
export class TooltipTriggerComponent {
  @Input()
  public triggerType: 'click' | 'hover' = 'click';

  public triggerActivate: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click', ['$event'])
  public click() {
    if (this.triggerType === 'click') {
      this.triggerActivate.emit();
    }
  }

  @HostListener('mouseenter', ['$event'])
  public mouseenter() {
    if (this.triggerType === 'hover') {
      this.triggerActivate.emit();
    }
  }

  @HostListener('mouseleave', ['$event'])
  public mouseleave() {
    if (this.triggerType === 'hover') {
      this.triggerActivate.emit();
    }
  }
}

