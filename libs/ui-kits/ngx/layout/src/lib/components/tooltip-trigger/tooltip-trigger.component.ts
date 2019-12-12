import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tooltip-trigger',
  templateUrl: './tooltip-trigger.component.html',
  styleUrls: ['./tooltip-trigger.component.scss']
})
export class TooltipTriggerComponent {
  public triggerActivate: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click', ['$event'])
  public click(event) {
    this.triggerActivate.emit();
  }

  constructor() {}
}
