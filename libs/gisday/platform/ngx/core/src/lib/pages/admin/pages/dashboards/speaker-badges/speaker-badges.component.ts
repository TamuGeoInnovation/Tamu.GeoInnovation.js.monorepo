import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, merge, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import * as Papa from 'papaparse';

import type { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { isAggieFormerStudent, matchesText, shortClassYear, speakerAffiliation } from '@tamu-gisc/gisday/platform/ngx/common';
import { RadioGroupComponent, SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { downloadFile } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

/** A speaker as a badge prints them (#2899), and whether it has been (#2908). */
export interface SpeakerBadge {
  guid: string;
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  /** A Texas A&M former student's class year as the site writes it after their name ('14), or blank (#1768). */
  formerStudentYear: string;
  /** When the badge was marked printed, or null. */
  printedAt: string | null;
  /** Marked printed, and what the badge would say now is not what it said then. */
  changedSincePrinted: boolean;
}

export type BadgeSort = { prop: keyof SpeakerBadge; dir: 'asc' | 'desc' } | null;
export type BadgeShow = 'not-printed' | 'all' | 'printed';

/** The columns, in order, with their headings: the table's and the CSV's. */
export const BADGE_COLUMNS: Array<{ prop: keyof SpeakerBadge; name: string }> = [
  { prop: 'firstName', name: 'First name' },
  { prop: 'lastName', name: 'Last name' },
  { prop: 'organization', name: 'Company / organization' },
  { prop: 'email', name: 'Email' },
  { prop: 'formerStudentYear', name: 'Former student year' }
];

/** The Show choice, Not printed yet first: what an admin opens the page for once printing has begun (#2908). */
export const BADGE_SHOW_OPTIONS: Array<{ value: BadgeShow; label: string }> = [
  { value: 'not-printed', label: 'Not printed yet' },
  { value: 'all', label: 'All' },
  { value: 'printed', label: 'Printed' }
];

/**
 * What prints under a speaker's name: their company or organization as the site shows it (speakerAffiliation), else
 * their university, so a faculty speaker's badge is not blank.
 */
export function organizationOf(speaker: Partial<Speaker>): string {
  return speakerAffiliation(speaker) || speaker.university?.name?.trim() || '';
}

/** What a badge says, as stored when it is marked printed: the name, organization and class year it prints. */
export function badgeText(badge: Pick<SpeakerBadge, 'firstName' | 'lastName' | 'organization' | 'formerStudentYear'>): string {
  return [badge.firstName, badge.lastName, badge.organization, badge.formerStudentYear].join('|');
}

/** Each speaker as a badge, by last name then first. */
export function badgesOf(speakers: Array<Partial<Speaker>>): Array<SpeakerBadge> {
  const text = (value: string | null | undefined) => (value ?? '').trim();

  return sortBadges(
    speakers.map((s) => {
      const badge = {
        guid: s.guid,
        firstName: text(s.firstName),
        lastName: text(s.lastName),
        organization: organizationOf(s),
        email: text(s.email),
        formerStudentYear: isAggieFormerStudent(s) ? shortClassYear(s.graduationYear) : ''
      };
      const printedAt = s.badgePrintedAt ? new Date(s.badgePrintedAt).toISOString() : null;

      return { ...badge, printedAt, changedSincePrinted: Boolean(printedAt) && (s.badgePrintedText ?? '') !== badgeText(badge) };
    }),
    null
  );
}

/** Whether a badge matches the search, in every column but the former student year (asked for on #2899). */
export function matchesBadge(badge: SpeakerBadge, search: string): boolean {
  return matchesText([`${badge.firstName} ${badge.lastName}`, badge.organization, badge.email], search);
}

/** Whether a badge is one the Show choice shows. A badge changed since printing counts as printed until reprinted. */
export function shownBy(badge: SpeakerBadge, show: BadgeShow): boolean {
  return show === 'all' || (show === 'printed') === Boolean(badge.printedAt);
}

/** The badges in the table's order: by a column, or by last name then first when none is chosen. */
export function sortBadges(badges: Array<SpeakerBadge>, sort: BadgeSort): Array<SpeakerBadge> {
  const compare = (a: unknown, b: unknown) => String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base', numeric: true });

  return [...badges].sort((a, b) =>
    sort
      ? (sort.dir === 'desc' ? -1 : 1) * compare(a[sort.prop], b[sort.prop])
      : compare(a.lastName, b.lastName) || compare(a.firstName, b.firstName)
  );
}

/** The badges as a CSV, in the order given, with the table's headings. */
export function badgesCsv(badges: Array<SpeakerBadge>): string {
  return Papa.unparse({
    fields: BADGE_COLUMNS.map((c) => c.name),
    data: badges.map((b) => BADGE_COLUMNS.map((c) => b[c.prop]))
  });
}

/**
 * The Speaker badges dashboard (#2899): every presenter of the season with what their name badge prints, in a table
 * that a search narrows, any heading sorts, and Export as CSV downloads as shown, for the badge-printing software.
 * Badges are marked printed once they are (#2908), so that as presenters are added only the new ones are shown and
 * exported; a badge marked printed whose speaker has changed since is flagged, to be reprinted.
 */
@Component({
  selector: 'tamu-gisc-speaker-badges',
  templateUrl: './speaker-badges.component.html',
  styleUrls: ['./speaker-badges.component.scss'],
  imports: [SelectComponent, TextboxComponent, RadioGroupComponent, ReactiveFormsModule, NgxDatatableModule, AsyncPipe, DatePipe]
})
export class SpeakerBadgesComponent extends BaseAdminListComponent<Speaker> implements OnInit {
  protected readonly entityService = inject(SpeakerService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns = BADGE_COLUMNS;
  public readonly showOptions = BADGE_SHOW_OPTIONS;
  // `search` is the admin list pages' own (#2914); this page filters by it itself, with matchesBadge.
  public readonly show = new FormControl<BadgeShow>('not-printed', { nonNullable: true });
  public view$: Observable<{ all: number; notPrinted: number; changed: number; shown: Array<SpeakerBadge> }>;

  /** The rows Mark as printed is about to mark, while the page asks to confirm; null when it is not asking. */
  public readonly confirming = signal<number | null>(null);
  public readonly saving = signal(false);
  public readonly saveFailed = signal(false);

  private readonly reload$ = new BehaviorSubject<void>(undefined);
  private year: number | undefined;
  /** The heading the table is sorted by, kept so the CSV comes out in the table's order. */
  private sort: BadgeSort = null;
  private shown: Array<SpeakerBadge> = [];

  public override ngOnInit(): void {
    super.ngOnInit();

    const badges$ = combineLatest([this.selectedSeason$, this.reload$]).pipe(
      switchMap(([season]) => (season?.guid ? this.entityService.getParticipatingPresentersForSeason(season.guid) : of([]))),
      map((speakers) => badgesOf(speakers ?? [])),
      shareReplay(1)
    );

    this.view$ = combineLatest([
      badges$,
      this.search.valueChanges.pipe(startWith(this.search.value)),
      this.show.valueChanges.pipe(startWith(this.show.value))
    ]).pipe(
      map(([badges, search, show]) => {
        this.shown = badges.filter((b) => shownBy(b, show) && matchesBadge(b, search));

        return {
          all: badges.length,
          notPrinted: badges.filter((b) => !b.printedAt).length,
          changed: badges.filter((b) => b.changedSincePrinted).length,
          shown: this.shown
        };
      }),
      shareReplay(1)
    );

    this.selectedSeason$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((season) => (this.year = season?.year));

    // A confirmation is for the rows shown when it was asked: changing what is shown withdraws it.
    merge(this.search.valueChanges, this.show.valueChanges, this.selectedSeason$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.confirming.set(null));
  }

  /** The table's sort as it changes: its own sortsChange, which carries the sort the table has just applied. */
  public onSort(sorts: Array<{ prop: string | number; dir: 'asc' | 'desc' }>) {
    const [sort] = sorts;

    this.sort = sort ? { prop: String(sort.prop) as keyof SpeakerBadge, dir: sort.dir } : null;
  }

  /** The CSV of what the table shows: the badges the Show choice and the search leave, in the table's order. */
  public csv(): string {
    return badgesCsv(sortBadges(this.shown, this.sort));
  }

  public download() {
    downloadFile(this.csv(), `gisday-speaker-badges${this.year ? '-' + this.year : ''}.csv`, 'text/csv');
  }

  /** Asks, on the page, before marking the rows shown as printed. */
  public askToMark() {
    this.saveFailed.set(false);
    this.confirming.set(this.shown.length);
  }

  /** Marks exactly the rows shown as printed, each with what its badge says, then reads the badges again. */
  public markShownPrinted() {
    const badges = this.shown.map((b) => ({ guid: b.guid, text: badgeText(b) }));

    this.save(this.entityService.markBadgesPrinted(badges));
  }

  /** Clears one badge's mark, to undo a mistake or to reprint it. */
  public markNotPrinted(badge: SpeakerBadge) {
    this.save(this.entityService.clearBadgesPrinted([badge.guid]));
  }

  private save(request: Observable<unknown>) {
    this.saving.set(true);
    this.saveFailed.set(false);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.confirming.set(null);
        this.reload$.next();
      },
      error: () => {
        this.saving.set(false);
        this.saveFailed.set(true);
      }
    });
  }
}
