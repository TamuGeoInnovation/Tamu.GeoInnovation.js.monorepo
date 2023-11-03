import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-event-row',
  templateUrl: './event-row.component.html',
  styleUrls: ['./event-row.component.scss']
})
export class EventRowComponent {
  @Input()
  public event: Partial<SimplifiedEvent>;

  @Input()
  public day: Partial<SeasonDay>;

  @Output()
  public eventRegister: EventEmitter<string> = new EventEmitter();

  @HostListener('click', ['$event'])
  public handleRowClick($event: MouseEvent) {
    // Ignore clicks from 'input' elements
    if (($event.target as HTMLElement).tagName !== 'INPUT') {
      this.rt.navigate(['/sessions/details', this.event.guid]);
    }
  }

  constructor(private readonly rt: Router) {}

  public emitRegisterEvent() {
    this.eventRegister.emit(this.event.guid);
  }
}
