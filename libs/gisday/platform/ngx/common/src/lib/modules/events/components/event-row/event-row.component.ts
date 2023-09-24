import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Event, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-event-row',
  templateUrl: './event-row.component.html',
  styleUrls: ['./event-row.component.scss']
})
export class EventRowComponent {
  @Input()
  public event: Partial<Event>;

  @Input()
  public day: Partial<SeasonDay>;

  @HostListener('click', ['$event'])
  public handleRowClick($event: MouseEvent) {
    // Ignore clicks from 'input' elements
    if (($event.target as HTMLElement).tagName !== 'INPUT') {
      this.rt.navigate(['/sessions/details', this.event.guid]);
    }
  }

  constructor(private readonly rt: Router) {}
}

