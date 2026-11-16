import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as Papa from 'papaparse';

import {
  DashboardPeopleComponent,
  DashboardPerson,
  groupPeople,
  peopleColumnWidths,
  peopleCsv,
  PEOPLE_TABLE_WIDTHS,
  PERSON_TYPE_COLUMNS
} from './dashboard-people.component';

const person = (p: Partial<DashboardPerson>): DashboardPerson => ({
  firstName: null,
  lastName: null,
  email: null,
  type: 'not-given',
  classification: null,
  department: null,
  position: null,
  organization: null,
  created: '2026-11-01T15:00:00.000Z',
  ...p
});

const people = [
  person({ firstName: 'Zoe', lastName: 'Young', email: 'zoe@example.edu', type: 'undergraduate', classification: 'Senior' }),
  person({ firstName: 'Ana', lastName: 'Lee', email: 'ana@example.edu', type: 'undergraduate', classification: 'Junior' }),
  person({ firstName: 'Pat', lastName: 'Kim', email: 'pat@example.edu', type: 'academia', position: 'Professor', organization: 'Texas A&M University' })
];

describe('groupPeople()', () => {
  it('puts people under their type in the dashboard order, by last name, and leaves out empty types', () => {
    expect(groupPeople(people).map((g) => [g.label, g.people.map((p) => p.lastName)])).toEqual([
      ['Undergraduate', ['Lee', 'Young']],
      ['Faculty & academia', ['Kim']]
    ]);
  });
});

describe('peopleCsv()', () => {
  it('writes one row per person, grouped and named as the page shows them, under the date heading given', () => {
    const csv = peopleCsv(people, "RSVP'd");
    const rows = Papa.parse<Record<string, string>>(csv, { header: true }).data;

    expect(csv.split(/\r?\n/)[0]).toBe(
      "Last name,First name,Email,Person type,Classification,Position,Department / field of study,University / employer,RSVP'd"
    );
    expect(rows.map((r) => [r['Last name'], r['Person type'], r['Classification'], r['Position']])).toEqual([
      ['Lee', 'Undergraduate', 'Junior', ''],
      ['Young', 'Undergraduate', 'Senior', ''],
      ['Kim', 'Faculty & academia', '', 'Professor']
    ]);
    expect(rows[2]['University / employer']).toBe('Texas A&M University');
    expect(rows[0]["RSVP'd"]).toBe('2026-11-01T15:00:00.000Z');
  });
});

describe('PERSON_TYPE_COLUMNS', () => {
  it('heads a column per type, in order, with a soft hyphen in Undergraduate only', () => {
    expect(PERSON_TYPE_COLUMNS.map((c) => c.key)).toEqual(['undergraduate', 'graduate', 'student', 'academia', 'industry', 'not-given']);
    expect(PERSON_TYPE_COLUMNS[0].label).toBe('Under\u00adgraduate');
    expect(PERSON_TYPE_COLUMNS.slice(1).every((c) => !c.label.includes('\u00ad'))).toBe(true);
  });
});

describe('DashboardPeopleComponent', () => {
  let fixture: ComponentFixture<DashboardPeopleComponent>;

  const show = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }

    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DashboardPeopleComponent] });
    fixture = TestBed.createComponent(DashboardPeopleComponent);
  });

  it('lists the people under their types, with the date column named as given', () => {
    const el = show({ people, dateLabel: 'Checked in' });

    expect(Array.from(el.querySelectorAll('h4')).map((h) => h.textContent.trim())).toEqual(['Undergraduate (2)', 'Faculty & academia (1)']);
    expect(el.querySelector('th:last-child').textContent).toBe('Checked in');
    expect(el.textContent).toContain('ana@example.edu');
  });

  // #2894: the VGI dashboard lists each submitter with their counts, before the date, and in the CSV.
  it('shows count columns when given, before the date, and puts them in the CSV', () => {
    const counted = people.map((p, i) => ({ ...p, counts: { submissions: i + 1, newFinds: i } }));
    const countColumns = [
      { key: 'submissions', label: 'Submissions' },
      { key: 'newFinds', label: 'New finds' }
    ];
    const el = show({ people: counted, dateLabel: 'First submitted', countColumns });

    expect(Array.from(el.querySelectorAll('h4 + table th')).map((th) => th.textContent.trim()).slice(-3)).toEqual([
      'Submissions',
      'New finds',
      'First submitted'
    ]);

    const rows = Papa.parse<Record<string, string>>(peopleCsv(counted, 'First submitted', countColumns), { header: true }).data;
    expect(rows.find((r) => r.Email === 'pat@example.edu')).toEqual(expect.objectContaining({ Submissions: '3', 'New finds': '2' }));
  });

  /**
   * #2894: the VGI dashboard's three count columns made nine, shared out by percentage, so at 1280 px the last were a
   * letter wide and "Submissions" was cut. The tables now sit in the dashboards' scrolling box, each column at least its
   * narrowest, so a wider table scrolls rather than squeezing a column.
   */
  it('puts the tables in the scrolling box, never narrower than their columns at their narrowest', () => {
    const counted = people.map((p) => ({ ...p, counts: { submissions: 1, newFinds: 0, repeats: 1 } }));
    const countColumns = [
      { key: 'submissions', label: 'Submissions' },
      { key: 'newFinds', label: 'New finds' },
      { key: 'repeats', label: 'Repeats' }
    ];
    const el = show({ people: counted, countColumns });
    const tables = Array.from(el.querySelectorAll<HTMLElement>('table'));
    const widths = peopleColumnWidths(3);

    expect(el.querySelector('tamu-gisc-dashboard-scroll .dashboard-scroll')).not.toBeNull();
    expect(tables.every((t) => t.closest('.dashboard-scroll'))).toBe(true);
    expect(widths).toHaveLength(9);
    expect(tables[0].style.minWidth).toBe(`${widths.reduce((a, b) => a + b, 0)}px`);
    expect(Array.from(tables[0].querySelectorAll('col')).map((c) => (c as HTMLElement).style.width)).toEqual(
      widths.map((w) => `${w}px`)
    );
  });

  it("gives each column room for its heading, and fits a person's six columns beside the admin menu at 1280 px", () => {
    // "Submissions" in the table's bold heading, with its padding, is about 104 px wide: an estimate, which the lab's
    // screenshot of an opened VGI row at 1280 px checks.
    expect(PEOPLE_TABLE_WIDTHS.count).toBeGreaterThanOrEqual(104);
    // An opened row gives the people about 820 px beside the admin menu at 1280 px (the table's 879, less the detail's
    // padding): six columns fit there without a scrollbar, as they did as shares of it.
    expect(peopleColumnWidths(0).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(820);
  });

  it('says so while reading, if the people could not be read, and if there are none', () => {
    expect(show({ people: null }).textContent).toContain('Reading the people');
    expect(show({ people: [], emptyText: 'Nobody has checked in yet.' }).textContent).toContain('Nobody has checked in yet.');
    expect(show({ people, failed: true }).textContent).toContain('could not be read');
  });
});
