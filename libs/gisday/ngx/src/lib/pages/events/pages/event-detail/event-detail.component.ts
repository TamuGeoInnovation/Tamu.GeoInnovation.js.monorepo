import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Event } from '@tamu-gisc/gisday/data-api';
import { CheckinService, EventService, SessionsService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-event-detail',
  // templateUrl: './session-detail.component.html',
  templateUrl: './event-detail-test.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  public eventGuid: string;
  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<any>;
  public isCheckinOpen = false;
  public selectedEvent: Partial<Event> = {
    abstract:
      'Another great TxGIS Day session will be announced soon. Check back to learn about the wonderful events the TxGIS Day team is bringing for this year.'
  };
  public event: Observable<Partial<Event>>;
  public now: Date = new Date();
  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private sessionsService: SessionsService,
    private checkinService: CheckinService
  ) {}

  public ngOnInit(): void {
    const guid = this.route.snapshot.params.guid;
    if (guid) {
      this.eventGuid = guid;
      this.event = this.eventService.getEntity(guid);
      this.numOfRsvps = this.eventService.getNumberOfRsvps(guid);
      // this.eventService.getNumberOfRsvps(this.eventGuid).subscribe((result) => console.log(result));
    }
  }

  public getNumberOfRsvps() {
    //this.numOfRsvps = this.sessionsService.getNumberOfRsvps(this.eventGuid);
    // this.sessionsService.getNumberOfRsvps(this.eventGuid).subscribe((result) => {
    //   console.log('NumOfRsvps', result);
    // });
  }

  public checkin() {
    this.checkinService.insertUserCheckin(this.eventGuid);
  }
}
