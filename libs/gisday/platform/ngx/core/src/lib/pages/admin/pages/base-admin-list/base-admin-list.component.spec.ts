import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { BaseService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { GuidIdentity } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from './base-admin-list.component';

@Component({ template: '', standalone: false })
class ThingListComponent extends BaseAdminListComponent<GuidIdentity> {
  protected readonly entityService = {
    getEntities: () => of([]),
    getEntitiesForActiveSeason: () => of([]),
    getEntitiesForSeason: (guid: string) => of([{ guid: 'for-' + guid }])
  } as unknown as BaseService<GuidIdentity>;
}

/**
 * Regression coverage (#2076). On a new site with no season, every admin list that picks a season
 * (Events, Speakers, Sponsors and the rest) was blank: `iif` built both of its branches at once, so
 * `getEntitiesForSeason(season.guid)` ran with no season and threw. The list now asks for the active
 * season's records, which a site with no season answers with none, and the page says so.
 */
describe('BaseAdminListComponent on a site with no season', () => {
  function open(active: { guid: string } | null) {
    TestBed.configureTestingModule({
      declarations: [ThingListComponent],
      providers: [
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(active) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: {} },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const component = TestBed.createComponent(ThingListComponent).componentInstance;
    component.ngOnInit();

    return component;
  }

  it('lists no records, rather than failing', async () => {
    await expect(firstValueFrom(open(null).entitiesForActiveSeasonOrForSeasonGuid$)).resolves.toEqual([]);
  });

  it("lists the active season's records when there is one", async () => {
    await expect(firstValueFrom(open({ guid: 'season-2026' }).entitiesForActiveSeasonOrForSeasonGuid$)).resolves.toEqual([
      { guid: 'for-season-2026' }
    ]);
  });
});
