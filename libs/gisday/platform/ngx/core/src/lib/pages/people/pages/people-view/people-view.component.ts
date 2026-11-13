import { Component, DestroyRef, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, debounceTime, map, startWith } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerCardComponent } from '@tamu-gisc/gisday/platform/ngx/common';

import { matchesSearch, presenterCount, presentersForRoute } from '../../presenters';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { AsyncPipe } from '@angular/common';

// The ordering, matching and count are shared with each presenter's page (#2919); exported from here as before.
export { compareByLastName, matchesSearch, presenterCount } from '../../presenters';

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerCardComponent, TextboxComponent, ReactiveFormsModule, AsyncPipe, ClipboardCopyDirective]
})
export class PeopleViewComponent implements OnInit {
  private speakerService = inject(SpeakerService);
  private seasonService = inject(SeasonService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** While the copy button has just copied, so it can say so. */
  public copied$: Observable<boolean>;

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

    // The address follows the box (#2921), so the page can be linked to already searched: replacing the history
    // entry, not adding one per keystroke, so Back still leaves the page.
    this.search.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe((search) => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { search: search.trim() || null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });

    this.view$ = combineLatest([this.people$, this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([people, search]) => {
        const shown = people.filter((p) => matchesSearch(p, search));

        return { shown, total: people.length, count: presenterCount(shown.length, people.length, search) };
      })
    );
  }

  /** The link to this list with the search filled in, whole, ready to paste into an email (#2921). */
  public link(): string {
    const tree = this.router.createUrlTree([], { relativeTo: this.route, queryParams: { search: this.search.value.trim() } });

    return window.location.origin + this.router.serializeUrl(tree);
  }
}
