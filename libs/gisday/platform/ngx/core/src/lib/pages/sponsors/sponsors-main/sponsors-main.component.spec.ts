import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { SponsorsMainComponent } from './sponsors-main.component';

/**
 * #1962. A sponsor switched off for its season stays in the admin pages but must not appear on the
 * public Sponsors page. The first version filtered on the landing page only; this page still showed it.
 */
describe('SponsorsMainComponent', () => {
  const sponsors = [
    { guid: 's-1', name: 'Landpoint', sponsorshipLevel: 'line', active: true },
    { guid: 's-2', name: 'Last year only', sponsorshipLevel: 'line', active: false },
    { guid: 's-3', name: 'Surge Energy America', sponsorshipLevel: 'point', active: true },
    { guid: 's-4', name: 'A LiDAR sponsor', sponsorshipLevel: 'lidar', active: true }
  ] as Array<Partial<Sponsor>>;

  function open(isPast: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        {
          provide: SeasonService,
          useValue: { seasonForRoute: () => of({ year: isPast ? 2025 : null, season: { guid: 'season-1' }, isPast }) }
        },
        {
          provide: SponsorService,
          useValue: { getEntitiesForActiveSeason: () => of(sponsors), getEntitiesForSeason: () => of(sponsors) }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new SponsorsMainComponent());
    component.ngOnInit();

    return component;
  }

  it('leaves a sponsor switched off for the season off the page', async () => {
    const component = open(false);

    await expect(firstValueFrom(component.lineSponsors$)).resolves.toEqual([sponsors[0]]);
    await expect(firstValueFrom(component.pointSponsors$)).resolves.toEqual([sponsors[2]]);
  });

  /**
   * #1976. LiDAR is the 2026 level above Raster; a sponsor recorded at it must have a group of its own.
   */
  it('groups LiDAR sponsors on their own', async () => {
    const component = open(false);

    await expect(firstValueFrom(component.lidarSponsors$)).resolves.toEqual([sponsors[3]]);
    await expect(firstValueFrom(component.rasterSponsors$)).resolves.toEqual([]);
  });

  it('does the same for a past year', async () => {
    const component = open(true);

    await expect(firstValueFrom(component.lineSponsors$)).resolves.toEqual([sponsors[0]]);
  });
});
