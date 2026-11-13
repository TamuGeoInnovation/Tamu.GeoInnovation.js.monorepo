import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import * as Papa from 'papaparse';

import type { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { badgesCsv, badgesOf, badgeText, matchesBadge, organizationOf, shownBy, sortBadges, SpeakerBadgesComponent } from './speaker-badges.component';

const tamu = { name: 'Texas A&M University', acronym: 'TAMU' };
const speakers = [
  { guid: 'g-young', firstName: 'Zoë', lastName: 'Young', email: 'zoe@example.com', graduationYear: '2011', organization: { name: 'Esri' }, university: tamu },
  { guid: 'g-lee', firstName: ' Ana ', lastName: 'lee', email: 'ana@example.edu', university: tamu },
  { guid: 'g-kim', firstName: 'Pat', lastName: 'Kim', email: null, affiliation: 'Texas Water Development Board', graduationYear: '1999' }
] as unknown as Array<Partial<Speaker>>;

/** The same speakers with Young's badge printed as it reads now, and Kim's printed before a change of employer. */
const printed = [
  { ...speakers[0], badgePrintedAt: '2026-11-13T17:00:00.000Z', badgePrintedText: "Zoë|Young|Esri|'11" },
  speakers[1],
  { ...speakers[2], badgePrintedAt: '2026-11-13T17:00:00.000Z', badgePrintedText: 'Pat|Kim|Texas Parks and Wildlife|' }
] as unknown as Array<Partial<Speaker>>;

describe('organizationOf()', () => {
  it('prints the company or organization as the site shows it, else the university', () => {
    expect(speakers.map(organizationOf)).toEqual(['Esri', 'Texas A&M University', 'Texas Water Development Board']);
  });
});

describe('badgesOf()', () => {
  it("gives each speaker as a badge, by last name ignoring case, with an Aggie's class year and nothing missing left blank", () => {
    expect(badgesOf(speakers).map(({ guid, firstName, lastName, organization, email, formerStudentYear }) => ({ guid, firstName, lastName, organization, email, formerStudentYear }))).toEqual([
      // A graduation year from anywhere but Texas A&M is not a former student year.
      { guid: 'g-kim', firstName: 'Pat', lastName: 'Kim', organization: 'Texas Water Development Board', email: '', formerStudentYear: '' },
      { guid: 'g-lee', firstName: 'Ana', lastName: 'lee', organization: 'Texas A&M University', email: 'ana@example.edu', formerStudentYear: '' },
      { guid: 'g-young', firstName: 'Zoë', lastName: 'Young', organization: 'Esri', email: 'zoe@example.com', formerStudentYear: "'11" }
    ]);
  });

  it('says when each was printed, and flags one whose badge would now say something else (#2908)', () => {
    expect(badgesOf(printed).map((b) => [b.lastName, b.printedAt, b.changedSincePrinted])).toEqual([
      ['Kim', '2026-11-13T17:00:00.000Z', true],
      ['lee', null, false],
      ['Young', '2026-11-13T17:00:00.000Z', false]
    ]);
  });
});

describe('badgeText()', () => {
  it('is what the badge prints: name, organization and class year, not the email', () => {
    expect(badgeText(badgesOf(speakers)[2])).toBe("Zoë|Young|Esri|'11");
  });
});

describe('shownBy()', () => {
  it('shows badges not printed yet, printed ones (changed ones too, until reprinted), or all', () => {
    const badges = badgesOf(printed);
    const names = (show: Parameters<typeof shownBy>[1]) => badges.filter((b) => shownBy(b, show)).map((b) => b.lastName);

    expect(names('not-printed')).toEqual(['lee']);
    expect(names('printed')).toEqual(['Kim', 'Young']);
    expect(names('all')).toEqual(['Kim', 'lee', 'Young']);
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
  let service: { getParticipatingPresentersForSeason: jest.Mock; markBadgesPrinted: jest.Mock; clearBadgesPrinted: jest.Mock };

  async function open(rows: Array<Partial<Speaker>> = speakers) {
    service = {
      getParticipatingPresentersForSeason: jest.fn(() => of(rows)),
      markBadgesPrinted: jest.fn(() => of({ marked: 1 })),
      clearBadgesPrinted: jest.fn(() => of({ cleared: 1 }))
    };
    TestBed.configureTestingModule({
      imports: [SpeakerBadgesComponent],
      providers: [
        provideRouter([]),
        { provide: SpeakerService, useValue: service },
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
  const link = (root: HTMLElement, text: string) => Array.from(root.querySelectorAll('a, button')).find((a) => a.textContent.includes(text)) as HTMLElement;

  it("lists the season's presenters, as the Presenters page reads them, under the five headings and Printed", async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;

    expect(service.getParticipatingPresentersForSeason).toHaveBeenCalledWith('s-1');
    expect(Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((h) => h.textContent.trim())).toEqual([
      'First name',
      'Last name',
      'Company / organization',
      'Email',
      'Former student year',
      'Printed'
    ]);
    expect(lastNames(root)).toEqual(['Kim', 'lee', 'Young']);
    expect(root.querySelector('.badges-counts').textContent.replace(/\s+/g, ' ')).toContain('3 presenters: 3 not printed yet.');
  });

  it('shows only the badges not printed yet at first, and the printed ones with their date, a flag if changed, on asking', async () => {
    const fixture = await open(printed);
    const root = fixture.nativeElement as HTMLElement;

    expect(lastNames(root)).toEqual(['lee']);
    expect(root.querySelector('.badges-counts').textContent.replace(/\s+/g, ' ')).toContain('1 printed badge has changed since');

    fixture.componentInstance.show.setValue('printed');
    await settle(fixture);

    expect(lastNames(root)).toEqual(['Kim', 'Young']);
    expect(root.querySelectorAll('.badges-changed')).toHaveLength(1);
    expect(csvLastNames(fixture.componentInstance.csv())).toEqual(['Kim', 'Young']);
  });

  it('marks exactly the rows shown as printed, each with what its badge says, only after confirming on the page', async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.search.setValue('texas');
    await settle(fixture);
    link(root, 'Mark these 2 as printed').click();
    await settle(fixture);

    expect(service.markBadgesPrinted).not.toHaveBeenCalled();
    expect(root.querySelector('.badges-confirm').textContent).toContain('Mark the 2 badges shown as printed?');

    link(root, 'Mark as printed').click();
    await settle(fixture);

    expect(service.markBadgesPrinted).toHaveBeenCalledWith([
      { guid: 'g-kim', text: 'Pat|Kim|Texas Water Development Board|' },
      { guid: 'g-lee', text: 'Ana|lee|Texas A&M University|' }
    ]);
    // The badges are read again, to show what is now printed.
    expect(service.getParticipatingPresentersForSeason).toHaveBeenCalledTimes(2);
    expect(root.querySelector('.badges-confirm')).toBeNull();
  });

  it('withdraws the confirmation when what is shown changes, and marks nothing on Cancel', async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;

    link(root, 'Mark these 3 as printed').click();
    await settle(fixture);
    fixture.componentInstance.search.setValue('esri');
    await settle(fixture);
    expect(root.querySelector('.badges-confirm')).toBeNull();

    link(root, 'Mark these 1 as printed').click();
    await settle(fixture);
    link(root, 'Cancel').click();
    await settle(fixture);

    expect(root.querySelector('.badges-confirm')).toBeNull();
    expect(service.markBadgesPrinted).not.toHaveBeenCalled();
  });

  it('marks one badge not printed again, and says so when marking fails', async () => {
    const fixture = await open(printed);
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.show.setValue('printed');
    await settle(fixture);
    (root.querySelector('.badges-undo') as HTMLElement).click();
    await settle(fixture);

    expect(service.clearBadgesPrinted).toHaveBeenCalledWith(['g-kim']);

    service.clearBadgesPrinted.mockReturnValue(throwError(() => new Error('403')));
    (root.querySelector('.badges-undo') as HTMLElement).click();
    await settle(fixture);

    expect(root.textContent).toContain('The badges could not be marked');
  });

  it('narrows the table and the CSV to what the search matches, and sorts both by a heading', async () => {
    const fixture = await open();
    const root = fixture.nativeElement as HTMLElement;
    const heading = Array.from(root.querySelectorAll('.datatable-header-cell-label')).find(
      (h) => h.textContent.trim() === 'Company / organization'
    ) as HTMLElement;

    heading.click();
    await settle(fixture);
    expect(lastNames(root)).toEqual(['Young', 'lee', 'Kim']);

    fixture.componentInstance.search.setValue('texas');
    await settle(fixture);

    expect(lastNames(root)).toEqual(['lee', 'Kim']);
    expect(csvLastNames(fixture.componentInstance.csv())).toEqual(['lee', 'Kim']);
  });
});
