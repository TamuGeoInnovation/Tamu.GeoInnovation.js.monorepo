import { Component, Input, OnInit } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { Event, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonDayService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-season-day-card',
  templateUrl: './season-day-card.component.html',
  styleUrls: ['./season-day-card.component.scss']
})
export class SeasonDayCardComponent implements OnInit {
  @Input()
  public seasonDay: Partial<SeasonDay>;

  @Input()
  public index: number;

  public events$: Observable<Array<Event>>;

  constructor(private readonly sd: SeasonDayService) {}

  public ngOnInit(): void {
    this.events$ = this.sd.getDayEvents(this.seasonDay.guid).pipe(shareReplay());
  }
}

