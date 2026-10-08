import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, shareReplay, map } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerCardComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerCardComponent, AsyncPipe]
})
export class PeopleViewComponent implements OnInit {
  public people$: Observable<Array<Partial<Speaker>>>;

  constructor(private speakerService: SpeakerService) {}

  public ngOnInit() {
    this.people$ = this.speakerService.getParticipatingPresenters().pipe(
      map((speakers) =>
        speakers.sort((a, b) => {
          const firstNameCompare = (a.firstName || '').localeCompare(b.firstName || '');
          if (firstNameCompare !== 0) {
            return firstNameCompare;
          }
          return (a.lastName || '').localeCompare(b.lastName || '');
        })
      ),
      shareReplay(1)
    );
  }
}
