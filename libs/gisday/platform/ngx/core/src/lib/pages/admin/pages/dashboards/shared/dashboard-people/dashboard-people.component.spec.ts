import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as Papa from 'papaparse';

import { DashboardPeopleComponent, DashboardPerson, groupPeople, peopleCsv, PERSON_TYPE_COLUMNS } from './dashboard-people.component';

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

  it('says so while reading, if the people could not be read, and if there are none', () => {
    expect(show({ people: null }).textContent).toContain('Reading the people');
    expect(show({ people: [], emptyText: 'Nobody has checked in yet.' }).textContent).toContain('Nobody has checked in yet.');
    expect(show({ people, failed: true }).textContent).toContain('could not be read');
  });
});
