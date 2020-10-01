import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionsService } from '@tamu-gisc/gisday/data-access';
import { Event } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-session-detail',
  // templateUrl: './session-detail.component.html',
  templateUrl: './detail-test.component.html',
  styleUrls: ['./session-detail.component.scss']
})
export class SessionDetailComponent implements OnInit {
  public eventGuid: string;
  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<any>;
  public selectedEvent: Partial<Event> = {
    abstract:
      'Another great TAMU GIS Day session will be announced soon. Check back to learn about the wonderful events the TAMU GIS Day team is bringing for this year.'
  };
  public event: Observable<Partial<Event>>;
  public now: Date = new Date();
  constructor(private route: ActivatedRoute, private sessionsService: SessionsService) {}

  public ngOnInit(): void {
    const guid = this.route.snapshot.params.guid;
    if (guid) {
      this.eventGuid = guid;
      this.event = this.sessionsService.getEntity(guid);
      this.numOfRsvps = this.sessionsService.getNumberOfRsvps(guid);
      // this.sessionsService.getEvent(this.eventGuid).subscribe((result) => console.log(result));
    }
  }

  public getNumberOfRsvps() {
    //this.numOfRsvps = this.sessionsService.getNumberOfRsvps(this.eventGuid);
    // this.sessionsService.getNumberOfRsvps(this.eventGuid).subscribe((result) => {
    //   console.log('NumOfRsvps', result);
    // });
  }
}
