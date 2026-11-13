import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import * as Papa from 'papaparse';

import type { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { badgesCsv, badgesOf, matchesBadge, organizationOf, sortBadges, SpeakerBadgesComponent } from './speaker-badges.component';

const tamu = { name: 'Texas A&M University', acronym: 'TAMU' };
const speakers = [
  { firstName: 'Zoë', lastName: 'Young', email: 'zoe@example.com', graduationYear: '2011', organization: { name: 'Esri' }, university: tamu },
  { firstName: ' Ana ', lastName: 'lee', email: 'ana@example.edu', university: tamu },
  { firstName: 'Pat', lastName: 'Kim', email: null, affiliation: 'Texas Water Development Board', graduationYear: '1999' }
] as unknown as Array<Partial<Speaker>>;

describe('organizationOf()', () => {
  it('prints the company or organization as the site shows it, else the university', () => {
    expect(speakers.map(organizationOf)).toEqual(['Esri', 'Texas A&M University', 'Texas Water Development Board']);
  });
});

describe('badgesOf()', () => {
  it("gives each speaker as a badge, by last name ignoring case, with an Aggie's class year and nothing missing left blank", () => {
    expect(badgesOf(speakers)).toEqual([
      // A graduation year from anywhere but Texas A&M is not a former student year.
      { firstName: 'Pat', lastName: 'Kim', organization: 'Texas Water Development Board', email: '', formerStudentYear: '' },
      { firstName: 'Ana', lastName: 'lee', organization: 'Texas A&M University', email: 'ana@example.edu', formerStudentYear: '' },
      { firstName: 'Zoë', lastName: 'Young', organization: 'Esri', email: 'zoe@example.com', formerStudentYear: "'11" }
    ]);
  });
});

describe('matchesBadge()', () => {
  const [kim, lee, young] = badgesOf(speakers);

  it('searches the name, the company or organization and the email, ignoring case and accents', () => {
    expect([kim, lee, young].filter((b) => matchesBadge(b, 'zoe young')).map((b) => b.lastName)).toEqual(['Young']);
    expect([kim, lee, young].filter((b) => matchesBadge(b, 'water')).map((b) => b.lastName)).toEqual(['Kim']);
    expect([kim, lee, young].filter((b) => matchesBadge(b, 'EXAMPLE.EDU')).map((b) => b.lastName)).toEqual(['lee']);
  });

  it('does not search the former student year', () => {
    expect(matchesBadge(young, "'11")).toBe(false);
    expect(matchesBadge(young, '11')).toBe(false);
  });
});

describe('sortBadges() and badgesCsv()', () => {
  it('sort by a column either way, and write the five columns with the headings the table shows', () => {
    const csv = badgesCsv(sortBadges(badgesOf(speakers), { prop: 'organization', dir: 'desc' }));
    const rows = Papa.parse<Record<string, string>>(csv, { header: true }).data;

    expect(csv.split(/\r?\n/)[0]).toBe('First name,Last name,Company / organization,Email,Former student year');
    expect(rows.map((r) => r['Last name'])).toEqual(['Kim', 'lee', 'Young']);
    expect(rows[2]['Former student year']).toBe("'11");
  });
});

describe('SpeakerBadgesComponent', () => {
  async function open() {
    TestBed.configureTestingModule({
      imports: [SpeakerBadgesComponent],
      providers: [
        provideRouter([]),
        { provide: SpeakerService, useValue: { getParticipatingPresentersForSeason: jest.fn(() => of(speakers)) } },
        { provide: SeasonService, useValue: { seasons$: of([{ guid: 's-1', year: 2026 }]), activeSeason$: of({ guid: 's-1', year: 2026 }) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const fixture = TestBed.createComponent(SpeakerBadgesComponent);
    await settle(fixture);

    return fixture;
  }

  async function settle(fixture: { detectChanges: () => void; whenStable: () => Promise<unknown> }) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const lastNames = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('datatable-body-row')).map((r) => r.querySelectorAll('.datatable-body-cell')[1].textContent.trim());
  const csvLastNames = (csv: string) => Papa.parse<Record<string, string>>(csv, { header: true }).data.map((r) => r['Last name']);

  it("lists the season's presenters, as the Presenters page reads them, under the five headings, with how many", async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;

    expect(TestBed.inject(SpeakerService).getParticipatingPresentersForSeason).toHaveBeenCalledWith('s-1');

    expect(Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((h) => h.textContent.trim())).toEqual([
      'First name',
      'Last name',
      'Company / organization',
      'Email',
      'Former student year'
    ]);
    expect(lastNames(root)).toEqual(['Kim', 'lee', 'Young']);
    expect(root.querySelector('.badges-summary').textContent).toContain('3 speakers');
  });

  it('narrows the table and the CSV to what the search matches, and says how many of how many', async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.search.setValue('texas');
    await settle(fixture);

    expect(lastNames(root)).toEqual(['Kim', 'lee']);
    expect(root.querySelector('.badges-summary').textContent.replace(/\s+/g, ' ')).toContain('Showing 2 of 3 speakers');
    expect(csvLastNames(fixture.componentInstance.csv())).toEqual(['Kim', 'lee']);

    fixture.componentInstance.search.setValue('nobody');
    await settle(fixture);
    expect(root.textContent).toContain('No speakers match "nobody"');
  });

  it('sorts by a heading, and exports in the order the table shows', async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;
    const heading = Array.from(root.querySelectorAll('.datatable-header-cell-label')).find(
      (h) => h.textContent.trim() === 'Company / organization'
    ) as HTMLElement;

    heading.click();
    await settle(fixture);

    expect(lastNames(root)).toEqual(['Young', 'lee', 'Kim']);
    expect(csvLastNames(fixture.componentInstance.csv())).toEqual(['Young', 'lee', 'Kim']);
  });
});
