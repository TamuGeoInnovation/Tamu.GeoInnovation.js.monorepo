import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonWinnersDto, gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import {
  PlaceService,
  SeasonService,
  SeasonWinnersService,
  SponsorService
} from '@tamu-gisc/gisday/platform/ngx/data-access';

import { LandingComponent } from './landing.component';

/**
 * #2431. Under Explore Events, the homepage had three links: the speed mentoring sign-up, the TX GIS Hero form and the
 * how-to video. Texas A&M's own site (gisday.tamu.edu) no longer shows them; txgisday.org keeps all three, and UCGIS
 * keeps its video.
 */
describe('LandingComponent', () => {
  const mentoring = 'a[href="https://tinyurl.com/GISDay2023SpeedMentoring"]';
  const hero = 'a[href^="https://docs.google.com/forms/"]';
  const video = 'a[href^="https://www.youtube.com/"]';

  function render(key: string) {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: gisdaySite(key) },
        { provide: SeasonService, useValue: { getActiveSeason: () => of({ year: 2026, days: [], firstEventTime: null }) } },
        { provide: SponsorService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: SeasonWinnersService, useValue: { shown: () => of(null) } }
      ]
    });

    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it("shows none of the three links on Texas A&M's site", () => {
    const page = render('tamu');

    expect(page.querySelector('a[href="/sessions"]')?.textContent).toContain('Explore Events');
    expect(page.querySelector(mentoring)).toBeNull();
    expect(page.querySelector(hero)).toBeNull();
    expect(page.querySelector(video)).toBeNull();
  });

  it('shows all three on txgisday.org', () => {
    const page = render('txgisday');

    expect(page.querySelector(mentoring)?.textContent).toContain('Career Cupid Speed Mentoring');
    expect(page.querySelector(hero)?.textContent).toContain('Nominate a TX GIS Hero');
    expect(page.querySelector(video)?.textContent).toContain('how to get started video');
  });

  it("keeps UCGIS's video, and still has no Texas A&M links", () => {
    const page = render('ucgis');

    expect(page.querySelector(video)?.textContent).toContain('how to get started video');
    expect(page.querySelector(mentoring)).toBeNull();
    expect(page.querySelector(hero)).toBeNull();
  });
});

/**
 * #3239. The research competitions' winners on the homepage: on gisday.tamu.edu only, in plain text, each place with its
 * people's names and its entry's title. The API answers with nothing until the season's GIS Day is over. Made up.
 */
describe('LandingComponent winners (#3239)', () => {
  const winners: SeasonWinnersDto = {
    year: 2026,
    competitions: [
      {
        competition: 'graduate-poster',
        label: 'Graduate poster competition',
        winners: [
          { place: 1, names: ['Avery Example', 'Blair Sample'], title: 'Rivers' },
          { place: 2, names: ['Casey Test'], title: 'Aquifers' }
        ]
      },
      {
        competition: 'undergraduate-presentation',
        label: 'Undergraduate presentation competition',
        winners: [{ place: 1, names: ['Drew Person'], title: 'A talk' }]
      },
      // #3243: a trail challenge winner is a person, with no title.
      {
        competition: 'trail',
        label: 'Trail challenge',
        winners: [{ place: 1, names: ['Riley Walker'], title: null }]
      }
    ]
  };

  function render(key: string, answer: SeasonWinnersDto | null) {
    const shown = jest.fn(() => of(answer));

    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: gisdaySite(key) },
        { provide: SeasonService, useValue: { getActiveSeason: () => of({ year: 2026, days: [], firstEventTime: null }) } },
        { provide: SponsorService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } },
        { provide: SeasonWinnersService, useValue: { shown } }
      ]
    });

    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    return { page: fixture.nativeElement as HTMLElement, shown };
  }

  it("shows each competition's places in order, with names and titles, on Texas A&M's site", () => {
    const { page } = render('tamu', winners);
    const section = page.querySelector('#winners');

    expect(section.querySelector('h1').textContent).toContain('2026 Competition Winners');
    expect(Array.from(section.querySelectorAll('h3')).map((h) => h.textContent.trim())).toEqual([
      'Graduate poster competition',
      'Undergraduate presentation competition',
      'Trail challenge'
    ]);
    expect(Array.from(section.querySelectorAll('.winner')).map((p) => p.textContent.replace(/\s+/g, ' ').trim())).toEqual([
      '1st Avery Example, Blair Sample Rivers',
      '2nd Casey Test Aquifers',
      '1st Drew Person A talk',
      '1st Riley Walker'
    ]);
  });

  it('shows no section when the API has none to show', () => {
    expect(render('tamu', null).page.querySelector('#winners')).toBeNull();
  });

  it.each(['txgisday', 'ucgis'])('does not ask for them on %s', (key) => {
    const { page, shown } = render(key, winners);

    expect(shown).not.toHaveBeenCalled();
    expect(page.querySelector('#winners')).toBeNull();
  });
});
