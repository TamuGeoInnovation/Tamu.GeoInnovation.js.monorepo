import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import * as Papa from 'papaparse';

import type { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { isAggieFormerStudent, matchesText, shortClassYear, speakerAffiliation } from '@tamu-gisc/gisday/platform/ngx/common';
import { SelectComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { downloadFile } from '@tamu-gisc/common/utils/ui';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

/** A speaker as a badge prints them (#2899). */
export interface SpeakerBadge {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  /** A Texas A&M former student's class year as the site writes it after their name ('14), or blank (#1768). */
  formerStudentYear: string;
}

export type BadgeSort = { prop: keyof SpeakerBadge; dir: 'asc' | 'desc' } | null;

/** The columns, in order, with their headings: the table's and the CSV's. */
export const BADGE_COLUMNS: Array<{ prop: keyof SpeakerBadge; name: string }> = [
  { prop: 'firstName', name: 'First name' },
  { prop: 'lastName', name: 'Last name' },
  { prop: 'organization', name: 'Company / organization' },
  { prop: 'email', name: 'Email' },
  { prop: 'formerStudentYear', name: 'Former student year' }
];

/**
 * What prints under a speaker's name: their company or organization as the site shows it (speakerAffiliation), else
 * their university, so a faculty speaker's badge is not blank.
 */
export function organizationOf(speaker: Partial<Speaker>): string {
  return speakerAffiliation(speaker) || speaker.university?.name?.trim() || '';
}

/** Each speaker as a badge, by last name then first. */
export function badgesOf(speakers: Array<Partial<Speaker>>): Array<SpeakerBadge> {
  const text = (value: string | null | undefined) => (value ?? '').trim();

  return sortBadges(
    speakers.map((s) => ({
      firstName: text(s.firstName),
      lastName: text(s.lastName),
      organization: organizationOf(s),
      email: text(s.email),
      formerStudentYear: isAggieFormerStudent(s) ? shortClassYear(s.graduationYear) : ''
    })),
    null
  );
}

/** Whether a badge matches the search, in every column but the former student year (asked for on #2899). */
export function matchesBadge(badge: SpeakerBadge, search: string): boolean {
  return matchesText([`${badge.firstName} ${badge.lastName}`, badge.organization, badge.email], search);
}

/** The badges in the table's order: by a column, or by last name then first when none is chosen. */
export function sortBadges(badges: Array<SpeakerBadge>, sort: BadgeSort): Array<SpeakerBadge> {
  const compare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

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
 * The Speaker badges dashboard (#2899): every speaker of the season with what their name badge prints, in a table that
 * a search narrows, any heading sorts, and Export as CSV downloads as shown, for the badge-printing software. The
 * speakers are the season's presenters as the Presenters page lists them: those in its sessions. The admin speaker
 * list's read gives every speaker record of the season, sessions or not (773 against 90 in the local copy of 2026).
 */
@Component({
  selector: 'tamu-gisc-speaker-badges',
  templateUrl: './speaker-badges.component.html',
  styleUrls: ['./speaker-badges.component.scss'],
  imports: [SelectComponent, TextboxComponent, ReactiveFormsModule, NgxDatatableModule, AsyncPipe]
})
export class SpeakerBadgesComponent extends BaseAdminListComponent<Speaker> implements OnInit {
  protected readonly entityService = inject(SpeakerService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns = BADGE_COLUMNS;
  public readonly search = new FormControl('', { nonNullable: true });
  public view$: Observable<{ all: number; shown: Array<SpeakerBadge> }>;

  private year: number | undefined;
  /** The heading the table is sorted by, kept so the CSV comes out in the table's order. */
  private sort: BadgeSort = null;
  private shown: Array<SpeakerBadge> = [];

  public override ngOnInit(): void {
    super.ngOnInit();

    const badges$ = this.selectedSeason$.pipe(
      switchMap((season) => (season?.guid ? this.entityService.getParticipatingPresentersForSeason(season.guid) : of([]))),
      map((speakers) => badgesOf(speakers ?? [])),
      shareReplay(1)
    );

    this.view$ = combineLatest([badges$, this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([badges, search]) => {
        this.shown = badges.filter((b) => matchesBadge(b, search));

        return { all: badges.length, shown: this.shown };
      }),
      shareReplay(1)
    );

    this.selectedSeason$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((season) => (this.year = season?.year));
  }

  /** The table's sort as it changes: its own sortsChange, which carries the sort the table has just applied. */
  public onSort(sorts: Array<{ prop: string | number; dir: 'asc' | 'desc' }>) {
    const [sort] = sorts;

    this.sort = sort ? { prop: String(sort.prop) as keyof SpeakerBadge, dir: sort.dir } : null;
  }

  /** The CSV of what the table shows: the badges the search leaves, in the table's order. */
  public csv(): string {
    return badgesCsv(sortBadges(this.shown, this.sort));
  }

  public download() {
    downloadFile(this.csv(), `gisday-speaker-badges${this.year ? '-' + this.year : ''}.csv`, 'text/csv');
  }
}
