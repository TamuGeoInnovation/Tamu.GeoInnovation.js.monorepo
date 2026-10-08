import { Component, HostListener, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { AbstractSlidingDrawerComponent } from '../../../../abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';

@Component({
  selector: 'tamu-gisc-tooltip-trigger',
  templateUrl: './tooltip-trigger.component.html',
  styleUrls: ['./tooltip-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AbstractSlidingDrawerComponent]
})
export class TooltipTriggerComponent {
  @Input()
  public triggerType: 'click' | 'hover' = 'click';

  public triggerActivate: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click')
  public click() {
    if (this.triggerType === 'click') {
      this.triggerActivate.emit();
    }
  }

  @HostListener('mouseenter')
  public mouseenter() {
    if (this.triggerType === 'hover') {
      this.triggerActivate.emit();
    }
  }

  @HostListener('mouseleave')
  public mouseleave() {
    if (this.triggerType === 'hover') {
      this.triggerActivate.emit();
    }
  }
}
