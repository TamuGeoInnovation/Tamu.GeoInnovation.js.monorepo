import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map, startWith } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerCardComponent } from '@tamu-gisc/gisday/platform/ngx/common';

import { matchesSearch, presenterCount, presentersForRoute } from '../../presenters';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

// The ordering, matching and count are shared with each presenter's page (#2919); exported from here as before.
export { compareByLastName, matchesSearch, presenterCount } from '../../presenters';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerCardComponent, TextboxComponent, ReactiveFormsModule, AsyncPipe]
})
export class PeopleViewComponent implements OnInit {
  private speakerService = inject(SpeakerService);
  private seasonService = inject(SeasonService);
  private route = inject(ActivatedRoute);

  public readonly search = new FormControl('', { nonNullable: true });

  /** The season's presenters, by last name. */
  public people$: Observable<Array<Partial<Speaker>>>;

  /** Those that match the search, how many there are in all, and what the page says about that. */
  public view$: Observable<{ shown: Array<Partial<Speaker>>; total: number; count: string }>;

  public ngOnInit() {
    this.people$ = presentersForRoute(this.route.snapshot, this.seasonService, this.speakerService);

    // A search carried here from a presenter's page (#2919).
    const carried = this.route.snapshot.queryParamMap?.get('search');

    if (carried) {
      this.search.setValue(carried);
    }

    this.view$ = combineLatest([this.people$, this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([people, search]) => {
        const shown = people.filter((p) => matchesSearch(p, search));

        return { shown, total: people.length, count: presenterCount(shown.length, people.length, search) };
      })
    );
  }
}
