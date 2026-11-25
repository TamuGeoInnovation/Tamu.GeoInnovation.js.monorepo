import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { GISDAY_SITE } from '../../site/site';
import { FooterComponent } from './footer.component';

/**
 * #3659. The footer's "Past Years" are the seasons before the active one. On a site with no active season (between seasons,
 * or before its first) the active season is null, and reading its year threw on every page: "Cannot read properties of
 * null (reading 'year')". With none active, the past years are the seasons before the current year.
 */
describe('FooterComponent, past years', () => {
  function footer(active: { year: number } | null) {
    TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: gisdaySite('') },
        {
          provide: SeasonService,
          useValue: {
            seasons$: of([{ year: 2001 }, { year: 3001 }, { year: 2000 }, { year: 2002 }]),
            activeSeason$: of(active),
            viewedSeason$: of(active),
            viewedYear$: of(active?.year ?? null)
          }
        },
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } }
      ]
    });

    const component = TestBed.createComponent(FooterComponent).componentInstance;
    component.ngOnInit();

    return component;
  }

  it('lists the seasons before the active one, newest first', async () => {
    await expect(firstValueFrom(footer({ year: 2002 }).pastYears$)).resolves.toEqual([2001, 2000]);
  });

  it('lists the seasons before this year when no season is active, rather than throwing', async () => {
    await expect(firstValueFrom(footer(null).pastYears$)).resolves.toEqual([2002, 2001, 2000]);
  });
});
