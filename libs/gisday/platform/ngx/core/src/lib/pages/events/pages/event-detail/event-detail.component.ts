import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map, Observable, switchMap, tap } from 'rxjs';

import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { DeepPartial } from 'typeorm';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<boolean>;
  public isCheckinOpen = false;
  public selectedEvent: Partial<Event> = {
    abstract:
      'Another great TxGIS Day session will be announced soon. Check back to learn about the wonderful events the TxGIS Day team is bringing for this year.'
  };
  public $event: Observable<DeepPartial<Event>>;
  public now: Date = new Date();

  constructor(private route: ActivatedRoute, private eventService: EventService, private checkinService: CheckinService) {}

  public ngOnInit(): void {
    this.$event = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((eventGuid) => this.eventService.getEntityWithRelations(eventGuid)),
      tap((event) => console.log('event', event))
    );
  }

  public getNumberOfRsvps() {
    // this.numOfRsvps = this.eventService.getNumberOfRsvps(this.eventGuid);
  }

  public checkin() {
    // this.checkinService.insertUserCheckin(this.eventGuid);
  }
}
