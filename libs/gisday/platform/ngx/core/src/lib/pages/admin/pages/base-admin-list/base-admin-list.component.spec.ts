import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, firstValueFrom, of } from 'rxjs';

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
        { provide: Router, useValue: { events: EMPTY } },
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

type Named = GuidIdentity & { name: string; city?: string };

@Component({ template: '', standalone: false })
class SearchedListComponent extends BaseAdminListComponent<Named> {
  protected readonly entityService = {
    getEntities: () => of([]),
    getEntitiesForActiveSeason: () => of([]),
    getEntitiesForSeason: () =>
      of([
        { guid: 'a', name: 'Texas A&M University', city: 'College Station' },
        { guid: 'b', name: 'Universidad de Bogotá', city: 'Bogotá' },
        { guid: 'c', name: 'Esri', city: 'Redlands' }
      ])
  } as unknown as BaseService<Named>;

  protected override readonly searchFields = (e: Partial<Named>) => [e.name, e.city];
}

/** #2914: a page that names the columns it shows gets a search over them. */
describe('BaseAdminListComponent search', () => {
  function open<C extends BaseAdminListComponent<Named>>(type: new (...args: Array<never>) => C) {
    TestBed.configureTestingModule({
      declarations: [type],
      providers: [
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of({ guid: 'season-2026' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: { events: EMPTY } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const component = TestBed.createComponent(type).componentInstance;
    component.ngOnInit();

    return component;
  }

  const guids = async (c: BaseAdminListComponent<Named>) => (await firstValueFrom(c.entitiesForActiveSeasonOrForSeasonGuid$)).map((e) => e.guid);

  it('lists every row with no search, and only the rows whose shown columns match, ignoring case and accents', async () => {
    const page = open(SearchedListComponent);

    expect(await guids(page)).toEqual(['a', 'b', 'c']);

    page.search.setValue('bogota');
    expect(await guids(page)).toEqual(['b']);

    page.search.setValue('COLLEGE');
    expect(await guids(page)).toEqual(['a']);
    await expect(firstValueFrom(page.searchCounts$)).resolves.toEqual({ shown: 1, total: 3 });
  });

  it('clears the selection when the search changes, so no hidden row stays selected', async () => {
    const page = open(SearchedListComponent);
    const selected: Array<Array<string>> = [];
    page.selectedRows$.subscribe((rows) => selected.push(rows));

    page.toggleRow('c');
    page.search.setValue('texas');

    expect(selected[selected.length - 2]).toEqual(['c']);
    expect(selected[selected.length - 1]).toEqual([]);
  });

  it('leaves a page that names no columns unsearched', async () => {
    const page = open(ThingListComponent as unknown as new () => BaseAdminListComponent<Named>);

    page.search.setValue('anything');
    expect(await guids(page)).toEqual(['for-season-2026']);
  });
});

/**
 * #2942. Escape on a details page goes back to the list it was opened from, as the browser's Back button does. The
 * season is in that list's address; its search is kept in the list's own history entry, so coming back to the entry
 * shows the list as it was left, while opening the list afresh starts with no search.
 */
describe('BaseAdminListComponent search, on the way back from a details page', () => {
  function open(state: unknown) {
    TestBed.configureTestingModule({
      declarations: [SearchedListComponent],
      providers: [
        provideLocationMocks(),
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of({ guid: 'season-2026' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: { events: EMPTY } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} }
      ]
    });

    const location = TestBed.inject(Location);
    location.replaceState('/admin/things?season=season-2025', '', state);

    const component = TestBed.createComponent(SearchedListComponent).componentInstance;
    component.ngOnInit();

    return { component, location };
  }

  it('keeps its search in the history entry it is on', () => {
    const { component, location } = open({ navigationId: 3 });

    component.search.setValue('bogota');

    expect(location.getState()).toEqual({ navigationId: 3, adminList: { search: 'bogota' } });
    expect(location.path()).toBe('/admin/things?season=season-2025');
  });

  it('shows the search it had when the browser comes back to that entry', async () => {
    const { component } = open({ navigationId: 3, adminList: { search: 'bogota' } });

    expect(component.search.value).toBe('bogota');
    expect((await firstValueFrom(component.entitiesForActiveSeasonOrForSeasonGuid$)).map((e) => e.guid)).toEqual(['b']);
  });

  it('starts with no search when opened afresh', () => {
    const { component } = open({ navigationId: 3 });

    expect(component.search.value).toBe('');
  });
});
