import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import * as Papa from 'papaparse';

import { RSVP_PERSON_TYPES, RsvpPersonType } from '@tamu-gisc/gisday/common';
import type { RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { downloadFile } from '@tamu-gisc/common/utils/ui';

/** A person as every dashboard lists them: their profile, and when they did what the dashboard counts. */
export type DashboardPerson = RsvpDashboardPerson;

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

/** People as a CSV, one row each, grouped as the page shows them; `dateLabel` heads the column of when they did it. */
export function peopleCsv(people: Array<DashboardPerson>, dateLabel: string): string {
  const columns = [
    'Last name',
    'First name',
    'Email',
    'Person type',
    'Classification',
    'Position',
    'Department / field of study',
    'University / employer',
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
      [dateLabel]: p.created
    }))
  );

  return Papa.unparse(rows, { columns });
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
  imports: [DatePipe]
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

  public readonly groups = computed(() => groupPeople(this.people() ?? []));
  public readonly isStudent = isStudent;

  public download() {
    const people = this.people();

    if (people) {
      downloadFile(peopleCsv(people, this.dateLabel()), `${this.fileName()}.csv`, 'text/csv');
    }
  }
}
