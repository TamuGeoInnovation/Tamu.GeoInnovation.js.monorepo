import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { combineLatest, map, Observable, startWith, switchMap } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerAvatarComponent, SpeakerClassBannerComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ParseDateTimeStringsPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { matchesSearch, presentersForRoute } from '../../presenters';

/** How many matches the box lists under itself; the rest are a link away, on the Presenters page. */
export const MATCHES_SHOWN = 10;

/** The other presenters a search on a presenter's page finds, the first MATCHES_SHOWN of them, and how many in all. */
export function otherMatches(
  people: Array<Partial<Speaker>>,
  search: string,
  current: string
): { shown: Array<Partial<Speaker>>; total: number } | null {
  if (!search.trim()) {
    return null;
  }

  const matching = people.filter((p) => p.guid !== current && matchesSearch(p, search));

  return { shown: matching.slice(0, MATCHES_SHOWN), total: matching.length };
}

@Component({
  selector: 'tamu-gisc-people-details',
  templateUrl: './people-details.component.html',
  styleUrls: ['./people-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SpeakerAvatarComponent,
    SpeakerClassBannerComponent,
    RouterLink,
    AsyncPipe,
    DatePipe,
    ParseDateTimeStringsPipe,
    MarkdownParsePipe,
    TextboxComponent,
    ReactiveFormsModule
  ]
})
export class PeopleDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private speakerService = inject(SpeakerService);
  private seasonService = inject(SeasonService);

  /** The Presenters page's search, here to get from one presenter to another (#2919). */
  public readonly search = new FormControl('', { nonNullable: true });
  public matches$: Observable<{ shown: Array<Partial<Speaker>>; total: number } | null>;
  /** Whether the matches panel is open: while the search has focus, until a presenter is chosen or Escape (#2923). */
  public readonly panelOpen = signal(false);

  public speakerGuid: string;
  public $speaker: Observable<Partial<Speaker>>;

  public ngOnInit(): void {
    this.$speaker = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((speakerGuid) => this.speakerService.getPresenter(speakerGuid))
    );

    const people$ = presentersForRoute(this.route.snapshot, this.seasonService, this.speakerService);

    this.matches$ = combineLatest([
      people$,
      this.search.valueChanges.pipe(startWith(this.search.value)),
      this.route.params.pipe(map((params) => params['guid']))
    ]).pipe(map(([people, search, current]) => otherMatches(people, search, current)));
  }

  /** Closes the matches panel, leaving what was typed. */
  public close() {
    this.panelOpen.set(false);
  }

  /** Closes the panel when focus leaves the box and its matches, as a click elsewhere on the page does. */
  public leaving(event: FocusEvent) {
    const container = event.currentTarget as HTMLElement;

    if (!container.contains(event.relatedTarget as Node | null)) {
      this.close();
    }
  }

  /** Opening another presenter clears the search, so their page opens on them rather than on the matches. */
  public opened() {
    this.close();
    this.search.setValue('');
  }
}
