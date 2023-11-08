import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';

import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  public $event: Observable<Partial<Event>>;
  public isLoggedIn$: Observable<boolean> = this.auth.isAuthenticated$;

  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<boolean>;
  public isCheckinOpen = false;
  public now: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private checkinService: CheckinService,
    private readonly auth: AuthService
  ) {}

  public ngOnInit(): void {
    this.$event = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((eventGuid) => this.eventService.getEvent(eventGuid))
    );
  }

  public getNumberOfRsvps() {
    // this.numOfRsvps = this.eventService.getNumberOfRsvps(this.eventGuid);
  }

  public checkin() {
    // this.checkinService.insertUserCheckin(this.eventGuid);
  }
}
