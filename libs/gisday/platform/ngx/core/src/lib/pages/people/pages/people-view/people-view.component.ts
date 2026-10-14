import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Observable, shareReplay, map, of, switchMap } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
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
  private speakerService = inject(SpeakerService);
  private seasonService = inject(SeasonService);
  private route = inject(ActivatedRoute);

  public people$: Observable<Array<Partial<Speaker>>>;

  public ngOnInit() {
    // A past year lists that year's presenters; the current year keeps its own lookup (#1758).
    this.people$ = this.seasonService.seasonForRoute(this.route.snapshot).pipe(
      switchMap(({ season, isPast }) => {
        if (!isPast) {
          return this.speakerService.getParticipatingPresenters();
        }

        return season ? this.speakerService.getParticipatingPresentersForSeason(season.guid) : of([]);
      }),
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
