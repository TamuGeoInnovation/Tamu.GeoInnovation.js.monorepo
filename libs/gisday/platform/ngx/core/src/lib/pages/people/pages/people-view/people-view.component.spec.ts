import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { compareByLastName, matchesSearch, PeopleViewComponent, presenterCount } from './people-view.component';

const person = (firstName: string, lastName: string, organization?: string, university?: [string, string]) => ({
  firstName,
  lastName,
  organization: organization ? ({ name: organization } as never) : undefined,
  university: university ? ({ name: university[0], acronym: university[1] } as never) : undefined
});

describe('Presenters', () => {
  /** #2860: by last name, then first name, without regard to case or accents. */
  it('lists presenters by last name, then first name', () => {
    const sorted = [person('Zoe', 'Adams'), person('Aaron', 'Pearce'), person('Ana', 'adams'), person('Émile', 'Ábel')].sort(
      compareByLastName
    );

    expect(sorted.map((p) => `${p.firstName} ${p.lastName}`)).toEqual(['Émile Ábel', 'Ana adams', 'Zoe Adams', 'Aaron Pearce']);
  });

  /** #2859: first name, last name, full name or organization, any case, accents ignored. */
  describe('search', () => {
    const alanna = person('Alanna', 'Jajeh', 'Freese & Nichols');

    it.each([['alanna'], ['JAJEH'], ['alanna jaj'], ['freese'], ['  nichols ']])('finds a presenter by "%s"', (text) => {
      expect(matchesSearch(alanna, text)).toBe(true);
    });

    it('ignores accents', () => {
      expect(matchesSearch(person('José', 'Landívar'), 'jose landivar')).toBe(true);
    });

    it('shows everyone for an empty search, and no one for text nobody has', () => {
      expect(matchesSearch(alanna, '')).toBe(true);
      expect(matchesSearch(alanna, 'esri')).toBe(false);
    });

    /** #2869: the presenter's university, by its full name or its abbreviation. */
    it.each([['texas a&m university'], ['Texas A&M'], ['TAMU'], ['tamu ']])('finds a presenter by university, "%s"', (text) => {
      expect(matchesSearch(person('Ana', 'Ruiz', 'City of Austin', ['Texas A&M University', 'TAMU']), text)).toBe(true);
    });

    it('finds no one by university when the presenter has none', () => {
      expect(matchesSearch(person('Ana', 'Ruiz', 'City of Austin'), 'tamu')).toBe(false);
    });
  });

  /** #2870: how many presenters the list holds, under it, with or without a search. */
  describe('count', () => {
    it('gives the total with no search', () => {
      expect(presenterCount(78, 78, '')).toBe('78 presenters');
      expect(presenterCount(1, 1, ' ')).toBe('1 presenter');
    });

    it('gives how many of the total a search shows', () => {
      expect(presenterCount(5, 78, 'tamu')).toBe('Showing 5 of 78 presenters');
      expect(presenterCount(0, 78, 'zzz')).toBe('Showing 0 of 78 presenters');
    });
  });
});

/** #2921: the address follows the search, and a copy button gives a link to the list already searched. */
describe('PeopleViewComponent link', () => {
  const presenters = [
    { guid: 'p-1', firstName: 'Mark', lastName: 'Allen', organization: { name: 'Lower Colorado River Authority' } },
    { guid: 'p-2', firstName: 'Ana', lastName: 'Lee', organization: { name: 'Esri' } }
  ];
  let navigate: jest.SpyInstance;

  function open(search: string | null = null) {
    TestBed.configureTestingModule({
      imports: [PeopleViewComponent],
      providers: [
        provideRouter([]),
        { provide: EnvironmentService, useValue: { value: () => '' } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => search } } } },
        { provide: SpeakerService, useValue: { getParticipatingPresenters: () => of(presenters) } },
        { provide: SeasonService, useValue: { seasonForRoute: () => of({ season: { guid: 's-1' }, isPast: false }) } }
      ]
    });

    navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(PeopleViewComponent);
    fixture.detectChanges();

    return fixture;
  }

  const copyButton = (root: HTMLElement) => root.querySelector('.search-copy') as HTMLElement;

  it('opens already searched from its address, with the copy button', () => {
    const fixture = open('lower');
    const root = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.search.value).toBe('lower');
    expect(root.querySelectorAll('tamu-gisc-speaker-card')).toHaveLength(1);
    expect(copyButton(root).textContent).toContain('Copy link');
  });

  it('shows no copy button with no search', () => {
    expect(copyButton(open().nativeElement)).toBeNull();
  });

  it('keeps the address in step with the box, replacing the history entry, and drops the search when cleared', fakeAsync(() => {
    const fixture = open();

    fixture.componentInstance.search.setValue('lower colorado');
    tick(300);
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { search: 'lower colorado' }, replaceUrl: true, queryParamsHandling: 'merge' }));

    fixture.componentInstance.search.setValue('  ');
    tick(300);
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { search: null } }));
  }));

  it('copies the whole link, ready to paste into an email', () => {
    const fixture = open('lower colorado');

    expect(fixture.componentInstance.link()).toBe(`${window.location.origin}/?search=lower%20colorado`);
  });
});
