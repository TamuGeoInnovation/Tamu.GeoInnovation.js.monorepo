import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { SeasonService, SeasonWinnersService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SeasonWinnersAdminDto, TrailChoice, TrailWinnersAdminDto, WinnerChoice } from '@tamu-gisc/gisday/common';

import { WinnersComponent, entryLabel, trailEntryLabel } from './winners.component';

/** The season's trail challenge submitters in the leaderboard's order, one place picked (#3243). Made up. */
const trailPage = (): TrailWinnersAdminDto => ({
  entries: [
    { account: 'auth0|walker', name: 'Riley Walker', points: 14 },
    { account: 'auth0|hiker', name: 'Quinn Hiker', points: 9 },
    { account: 'auth0|nameless', name: null, points: 1 }
  ],
  winners: [{ place: 1, account: 'auth0|walker' }]
});

/** A season with two graduate posters and one undergraduate talk accepted, and one place picked. Made up. */
const page = (): SeasonWinnersAdminDto => ({
  competitions: [
    {
      competition: 'graduate-poster',
      label: 'Graduate poster competition',
      entries: [
        { guid: 'aquifers', title: 'Aquifers', names: ['Avery Example'] },
        { guid: 'rivers', title: 'Rivers', names: ['Blair Sample', 'Casey Test'] }
      ]
    },
    { competition: 'undergraduate-poster', label: 'Undergraduate poster competition', entries: [] },
    { competition: 'graduate-presentation', label: 'Graduate presentation competition', entries: [] },
    {
      competition: 'undergraduate-presentation',
      label: 'Undergraduate presentation competition',
      entries: [{ guid: 'talk', title: 'A talk', names: ['Drew Person'] }]
    }
  ],
  winners: [{ competition: 'graduate-poster', place: 1, submission: 'rivers' }]
});

/** #3239: the admins' Winners page picks 1st, 2nd and 3rd of each competition from its accepted entries. */
describe('WinnersComponent (#3239)', () => {
  async function open(service: Partial<Record<keyof SeasonWinnersService, jest.Mock>> = {}) {
    const winners = {
      forSeason: jest.fn(() => of(page())),
      save: jest.fn((_season: string, _winners: Array<WinnerChoice>) => of(page())),
      trail: jest.fn(() => of(trailPage())),
      saveTrail: jest.fn((_season: string, _winners: Array<TrailChoice>) => of(trailPage())),
      ...service
    };

    TestBed.configureTestingModule({
      imports: [WinnersComponent],
      providers: [
        { provide: SeasonWinnersService, useValue: winners },
        {
          provide: SeasonService,
          useValue: {
            activeSeason$: of({ guid: 'season-2026', year: 2026 }),
            seasons$: of([{ guid: 'season-2026', year: 2026 }])
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(WinnersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const save = async () => {
      (root.querySelector('input[type="button"][value="Save winners"]') as HTMLInputElement).click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { fixture, root, winners, save, component: fixture.componentInstance };
  }

  it("reads the active season's competitions, with three places for each that has entries", async () => {
    const { root, winners } = await open();
    const sections = Array.from(root.querySelectorAll('.winners-competition'));

    expect(winners.forSeason).toHaveBeenCalledWith('season-2026');
    expect(sections.map((s) => s.querySelector('.form-section-title').textContent.trim())).toEqual([
      'Graduate poster competition',
      'Undergraduate poster competition',
      'Graduate presentation competition',
      'Undergraduate presentation competition'
    ]);
    expect(sections[0].querySelectorAll('tamu-gisc-select')).toHaveLength(3);
    expect(Array.from(sections[0].querySelectorAll('option')).map((o) => o.textContent.trim())).toEqual(
      expect.arrayContaining(['1st place', 'Avery Example - Aquifers', 'Blair Sample - Rivers (with Casey Test)'])
    );
    expect(sections[1].textContent).toContain('No accepted entries this season.');
    expect(root.textContent).toContain('Trail challenge');
    // #3243: the trail challenge's three places, from its submitters in the leaderboard's order.
    const trail = Array.from(root.querySelectorAll('.form-section')).find((s) =>
      s.querySelector('.form-section-title')?.textContent.includes('Trail challenge')
    );

    expect(trail.querySelectorAll('tamu-gisc-select')).toHaveLength(3);
    expect(
      Array.from(trail.querySelector('tamu-gisc-select').querySelectorAll('option'))
        .slice(1)
        .map((o) => o.textContent.trim())
    ).toEqual(['Riley Walker (14 points)', 'Quinn Hiker (9 points)', 'No name given (1 point)']);
  });

  it('starts from the places already picked, and saves every place, those not picked empty', async () => {
    const { component, winners, save, root } = await open();

    expect(component.picked('graduate-poster', 1)).toBe('rivers');

    component.pick('graduate-poster', 2, 'aquifers');
    component.pick('undergraduate-presentation', 1, 'talk');
    await save();

    const [season, sent] = winners.save.mock.calls[0];

    expect(season).toBe('season-2026');
    expect(sent).toHaveLength(12);
    expect(sent.filter((c) => c.submission)).toEqual([
      { competition: 'graduate-poster', place: 1, submission: 'rivers' },
      { competition: 'graduate-poster', place: 2, submission: 'aquifers' },
      { competition: 'undergraduate-presentation', place: 1, submission: 'talk' }
    ]);
    expect(root.textContent).toContain('Saved.');
    // The trail challenge's places go with them, those not picked empty (#3243).
    expect(winners.saveTrail).toHaveBeenCalledWith('season-2026', [
      { place: 1, account: 'auth0|walker' },
      { place: 2, account: null },
      { place: 3, account: null }
    ]);
  });

  it('refuses one entry in two places before sending', async () => {
    const { component, winners, save, root } = await open();

    component.pick('graduate-poster', 2, 'rivers');
    await save();

    expect(winners.save).not.toHaveBeenCalled();
    expect(root.textContent).toContain('A submission can win only one place in its competition.');
  });

  it("says why the API refused, in the API's words", async () => {
    const refused = new HttpErrorResponse({
      status: 400,
      error: { statusCode: 400, message: "A winner must be one of the competition's accepted submissions this season." }
    });
    const { save, root } = await open({ save: jest.fn(() => throwError(() => refused)) });

    await save();

    expect(root.textContent).toContain("A winner must be one of the competition's accepted submissions this season.");
  });

  // #3292: a long title cut the names off, so who was who could not be seen. The main author comes first.
  it('offers an entry by its main author, then its title, then anyone else on it', () => {
    expect(entryLabel({ guid: 'x', title: 'Rivers', names: ['Blair Sample', 'Casey Test'] })).toBe(
      'Blair Sample - Rivers (with Casey Test)'
    );
    expect(entryLabel({ guid: 'x', title: 'Rivers', names: ['Blair Sample'] })).toBe('Blair Sample - Rivers');
    expect(entryLabel({ guid: 'x', title: null, names: ['Blair Sample'] })).toBe('Blair Sample - Untitled');
    expect(entryLabel({ guid: 'x', title: 'Rivers', names: [] })).toBe('No name given - Rivers');
  });

  it('refuses one person in two trail places before sending (#3243)', async () => {
    const { component, winners, save, root } = await open();

    component.pick('trail', 2, 'auth0|walker');
    await save();

    expect(winners.save).not.toHaveBeenCalled();
    expect(winners.saveTrail).not.toHaveBeenCalled();
    expect(root.textContent).toContain('A person can win only one place.');
  });

  it('offers a submitter by name and points (#3243)', () => {
    expect(trailEntryLabel({ account: 'a', name: 'Riley Walker', points: 14 })).toBe('Riley Walker (14 points)');
    expect(trailEntryLabel({ account: 'a', name: null, points: 1 })).toBe('No name given (1 point)');
  });
});
