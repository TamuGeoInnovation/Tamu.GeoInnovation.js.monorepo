import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { RSVP_PERSON_TYPES, RsvpPersonType } from '@tamu-gisc/gisday/common';
import type { RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { downloadFile, toCsv } from '@tamu-gisc/common/utils/ui';

import type { DashboardTableColumn } from '../dashboard-table/dashboard-table.component';
import { DashboardScrollComponent } from '../dashboard-scroll/dashboard-scroll.component';

/**
 * A person as every dashboard lists them: their profile, when they did what the dashboard counts, and any counts of
 * their own, such as a VGI submitter's submissions (#2894).
 */
export type DashboardPerson = RsvpDashboardPerson & { counts?: Record<string, number> };

export interface DashboardPeopleGroup {
  type: RsvpPersonType;
  label: string;
  people: Array<DashboardPerson>;
}

/** The people under their type's heading, in the dashboards' order of types, each group by last name. */
export function groupPeople(people: Array<DashboardPerson>): Array<DashboardPeopleGroup> {
  const name = (p: DashboardPerson) => `${p.lastName ?? ''} ${p.firstName ?? ''} ${p.email ?? ''}`.trim().toLowerCase();

  return RSVP_PERSON_TYPES.map(({ type, label }) => ({
    type,
    label,
    people: people.filter((p) => p.type === type).sort((a, b) => name(a).localeCompare(name(b)))
  })).filter((group) => group.people.length > 0);
}

/**
 * People as a CSV, one row each, grouped as the page shows them; `dateLabel` heads the column of when they did it, after
 * any `countColumns`.
 */
export function peopleCsv(
  people: Array<DashboardPerson>,
  dateLabel: string,
  countColumns: Array<DashboardTableColumn> = []
): string {
  const columns = [
    'Last name',
    'First name',
    'Email',
    'Person type',
    'Classification',
    'Position',
    'Department / field of study',
    'University / employer',
    ...countColumns.map((c) => c.label),
    dateLabel
  ];
  const rows = groupPeople(people).flatMap((group) =>
    group.people.map((p) => ({
      'Last name': p.lastName ?? '',
      'First name': p.firstName ?? '',
      Email: p.email ?? '',
      'Person type': group.label,
      Classification: p.classification ?? '',
      Position: p.position ?? '',
      'Department / field of study': p.department ?? '',
      'University / employer': p.organization ?? '',
      ...Object.fromEntries(countColumns.map((c) => [c.label, p.counts?.[c.key] ?? 0])),
      [dateLabel]: p.created
    }))
  );

  return toCsv(columns, rows);
}

/**
 * A column per person type, for a dashboard's table. "Undergraduate" carries a soft hyphen, shown only if the word must
 * break: Chrome does not hyphenate a word that starts with a capital, so in a narrow column it was cut to "Undergradu".
 * "classification" is wider than a count column too, and carries one rather than relying on the browser's dictionary
 * (#3219). The types' own labels have none, because they also go into CSV files.
 */
export const PERSON_TYPE_COLUMNS: Array<DashboardTableColumn> = RSVP_PERSON_TYPES.map(({ type, label }) => ({
  key: type,
  label: label.replace('Undergraduate', 'Under\u00adgraduate').replace('classification', 'classi\u00adfication')
}));

/**
 * The narrowest each column of the people's tables may be, in pixels (#2894). The six a person always has fit the width
 * an opened row gives them beside the admin menu at 1280 px (about 820 px), as they did when they were shares of it. A
 * count column holds its heading, "Submissions", whole: shared out by percentage, the VGI dashboard's three count
 * columns were left a letter wide, and the date column below them one letter a line. The email column gave 10 px when
 * the people's box was capped (#3120): a long list's up-and-down scrollbar leaves them about 800 px.
 */
export const PEOPLE_TABLE_WIDTHS = { name: 140, email: 190, detail: 120, date: 110, count: 110 } as const;

/** Each column's narrowest, in order: name, email, the three details, any counts, then the date. */
export function peopleColumnWidths(countColumns: number): Array<number> {
  const { name, email, detail, date, count } = PEOPLE_TABLE_WIDTHS;

  return [name, email, detail, detail, detail, ...Array<number>(countColumns).fill(count), date];
}

/** A student's group shows classification, field of study and university; anyone else's, position, department and employer. */
export function isStudent(type: RsvpPersonType): boolean {
  return type === 'undergraduate' || type === 'graduate' || type === 'student';
}

/**
 * The people behind one row of a dashboard (#2891): under their type's heading, with an export of them as a CSV. Says
 * so while they are read (`people` null), if they could not be, and if there are none. First used by the RSVP
 * dashboard (#2878).
 */
@Component({
  selector: 'tamu-gisc-dashboard-people',
  templateUrl: './dashboard-people.component.html',
  styleUrls: ['./dashboard-people.component.scss'],
  imports: [DatePipe, DashboardScrollComponent]
})
export class DashboardPeopleComponent {
  /** The people, or null while they are read. */
  public readonly people = input<Array<DashboardPerson> | null>(null);
  public readonly failed = input(false);
  /** The CSV's file name, without `.csv`. */
  public readonly fileName = input('people');
  /** The heading of the column of when each person did what is counted, such as "RSVP'd". */
  public readonly dateLabel = input('When');
  public readonly emptyText = input('Nobody yet.');
  /** Counts of each person's own, shown before the date, such as a submitter's submissions (#2894). */
  public readonly countColumns = input<Array<DashboardTableColumn>>([]);

  public readonly groups = computed(() => groupPeople(this.people() ?? []));
  /** Each column's narrowest, and the table's: every column at its narrowest, so a wider table scrolls. */
  public readonly widths = computed(() => peopleColumnWidths(this.countColumns().length));
  public readonly minWidth = computed(() => this.widths().reduce((sum, w) => sum + w, 0));
  public readonly isStudent = isStudent;

  public download() {
    const people = this.people();

    if (people) {
      downloadFile(peopleCsv(people, this.dateLabel(), this.countColumns()), `${this.fileName()}.csv`, 'text/csv');
    }
  }
}
