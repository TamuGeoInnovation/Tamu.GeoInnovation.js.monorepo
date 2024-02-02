import { Component, OnInit } from '@angular/core';

import { Observable, shareReplay } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss']
})
export class PeopleViewComponent implements OnInit {
  public people$: Observable<Array<Partial<Speaker>>>;

  constructor(private speakerService: SpeakerService) {}

  public ngOnInit() {
    this.people$ = this.speakerService.getActivePresenters().pipe(shareReplay());
  }
}
