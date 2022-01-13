import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { Event } from '@tamu-gisc/gisday/data-api';
import { CheckinService, EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  public eventGuid: string;
  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<boolean>;
  public isCheckinOpen = false;
  public selectedEvent: Partial<Event> = {
    abstract:
      'Another great TxGIS Day session will be announced soon. Check back to learn about the wonderful events the TxGIS Day team is bringing for this year.'
  };
  public event: Observable<Partial<Event>>;
  public now: Date = new Date();
  constructor(private route: ActivatedRoute, private eventService: EventService, private checkinService: CheckinService) {}

  public ngOnInit(): void {
    const guid = this.route.snapshot.params.guid;
    if (guid) {
      this.eventGuid = guid;
      this.event = this.eventService.getEntity(guid);
      this.numOfRsvps = this.eventService.getNumberOfRsvps(guid);
    }
  }

  public getNumberOfRsvps() {
    this.numOfRsvps = this.eventService.getNumberOfRsvps(this.eventGuid);
  }

  public checkin() {
    this.checkinService.insertUserCheckin(this.eventGuid);
  }
}
