import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { PlaceService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } }
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
