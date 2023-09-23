import { Component, Input } from '@angular/core';

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
}

