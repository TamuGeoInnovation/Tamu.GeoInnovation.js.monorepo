import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { GISDAY_SITE } from '../../site/site';
import { FooterComponent } from './footer.component';

/**
 * #3611. The footer's Past Years are the seasons before the active one, newest first. With no active season (a new
 * site, or one whose season is not set yet) there are none, rather than an error that leaves the list unfinished.
 */
describe('FooterComponent past years', () => {
  function pastYears(active: { year?: number } | null) {
    const footer = TestBed.configureTestingModule({
      providers: [
        { provide: GISDAY_SITE, useValue: gisdaySite('txgisday') },
        {
          provide: SeasonService,
          useValue: {
            viewedSeason$: of(active),
            viewedYear$: of(null),
            seasons$: of([{ year: 2023 }, { year: 2025 }, {}, { year: 2024 }, { year: 2026 }]),
            activeSeason$: of(active)
          }
        },
        { provide: PlaceService, useValue: { getEntitiesForActiveSeason: () => of([]) } }
      ]
    }).runInInjectionContext(() => new FooterComponent());

    footer.ngOnInit();

    return firstValueFrom(footer.pastYears$);
  }

  it('lists the years before the active one, newest first', async () => {
    expect(await pastYears({ year: 2025 })).toEqual([2024, 2023]);
  });

  it('lists none while there is no active season', async () => {
    expect(await pastYears(null)).toEqual([]);
  });
});
