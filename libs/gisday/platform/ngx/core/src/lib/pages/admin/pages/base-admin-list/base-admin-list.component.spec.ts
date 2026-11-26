import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, firstValueFrom, of, throwError } from 'rxjs';

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

  const guids = async (c: BaseAdminListComponent<Named>) =>
    (await firstValueFrom(c.entitiesForActiveSeasonOrForSeasonGuid$)).map((e) => e.guid);

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

@Component({ template: '', standalone: false })
class FilteredListComponent extends SearchedListComponent {
  /** A filter of the page's own, as the Events list has: 'esri' keeps only Esri. */
  public readonly only = new FormControl('', { nonNullable: true });

  protected override listFilters(): Record<string, FormControl<string>> {
    return { ...super.listFilters(), only: this.only };
  }

  protected override keepEntity(entity: Partial<Named>): boolean {
    return this.only.value !== 'esri' || entity.name === 'Esri';
  }
}

/**
 * #3049. When the search or a page's filter hid every row, an admin list said the season had none ("There are no events
 * for the selected season"), which reads as if the season had lost them. The list now tells the two apart, and its
 * search and filters can be cleared at once.
 */
describe('BaseAdminListComponent with nothing shown', () => {
  function open<C extends BaseAdminListComponent<Named>>(
    type: new (...args: Array<never>) => C,
    active: { guid: string } | null
  ) {
    TestBed.configureTestingModule({
      declarations: [type],
      providers: [
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(active) } },
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

  const season = { guid: 'season-2026' };

  it('says nothing while it shows rows', async () => {
    const page = open(FilteredListComponent, season);

    await expect(firstValueFrom(page.emptyBecause$)).resolves.toBeNull();
    await expect(firstValueFrom(page.filtersInUse$)).resolves.toBe(false);
  });

  it('tells a search that hides every row from a season with none', async () => {
    const page = open(FilteredListComponent, season);

    page.search.setValue('no such row');

    await expect(firstValueFrom(page.emptyBecause$)).resolves.toBe('hidden');
    await expect(firstValueFrom(page.filtersInUse$)).resolves.toBe(true);
  });

  it("tells a page's own filter, with a search, that hides every row from a season with none", async () => {
    const page = open(FilteredListComponent, season);

    page.only.setValue('esri');
    page.search.setValue('texas');

    await expect(firstValueFrom(page.emptyBecause$)).resolves.toBe('hidden');
  });

  it('says a season with no rows has none', async () => {
    const page = open(ThingListComponent as unknown as new () => BaseAdminListComponent<Named>, null);

    page.search.setValue('anything');

    await expect(firstValueFrom(page.emptyBecause$)).resolves.toBe('none');
  });

  it('clears the search and every filter of the page at once', async () => {
    const page = open(FilteredListComponent, season);

    page.only.setValue('esri');
    page.search.setValue('texas');
    page.clearFilters();

    expect(page.search.value).toBe('');
    expect(page.only.value).toBe('');
    await expect(firstValueFrom(page.entitiesForActiveSeasonOrForSeasonGuid$)).resolves.toHaveLength(3);
    await expect(firstValueFrom(page.filtersInUse$)).resolves.toBe(false);
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

@Component({ template: '', standalone: false })
class DeletingListComponent extends BaseAdminListComponent<GuidIdentity> {
  public reads = 0;
  public refuse = false;

  protected readonly entityService = {
    getEntities: () => of([]),
    getEntitiesForActiveSeason: () => of([]),
    getEntitiesForSeason: () => {
      this.reads++;

      return of([{ guid: 'a' }]);
    },
    deleteEntities: () => (this.refuse ? throwError(() => ({ status: 404, statusText: 'Not Found' })) : of({}))
  } as unknown as BaseService<GuidIdentity>;
}

/**
 * #2992. Research Competitions' Delete did nothing: the API refused it, and the page said nothing. A delete that works
 * reads the list again, once, so the row goes.
 */
describe('BaseAdminListComponent delete', () => {
  function open(refuse: boolean) {
    const toast = vi.fn();

    TestBed.configureTestingModule({
      declarations: [DeletingListComponent],
      providers: [
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of({ guid: 'season-2026' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: { events: EMPTY } },
        { provide: ModalService, useValue: { open: () => of({ delete: true, identities: ['a'] }) } },
        { provide: NotificationService, useValue: { toast } }
      ]
    });

    const component = TestBed.createComponent(DeletingListComponent).componentInstance;

    component.refuse = refuse;
    component.ngOnInit();
    component.entitiesForActiveSeasonOrForSeasonGuid$.subscribe();

    return { component, toast };
  }

  it('reads the list again once after a delete, so the row goes', () => {
    const { component } = open(false);
    const before = component.reads;

    component.promptDeleteModal('Submission');

    expect(component.reads).toBe(before + 1);
  });

  it('says so when nothing was deleted', () => {
    const { component, toast } = open(true);

    component.promptDeleteModal('Submission');

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Submission Not Deleted' }));
  });
});

@Component({ template: '', standalone: false })
class CopyingListComponent extends BaseAdminListComponent<GuidIdentity> {
  public readonly copied = vi.fn(() => of({}));
  public readonly deleted = vi.fn(() => of({}));

  protected readonly entityService = {
    getEntities: () => of([]),
    getEntitiesForActiveSeason: () => of([]),
    getEntitiesForSeason: () => of([]),
    copyEntitiesIntoSeason: this.copied,
    deleteEntity: this.deleted
  } as unknown as BaseService<GuidIdentity>;
}

/**
 * #3627. With strictNullChecks on, what a row or the copy window may lack is checked: a copy with no season to copy into
 * (a site with none yet, #2076) is not sent, a row with no guid is neither deleted nor selected.
 */
describe('BaseAdminListComponent with a missing season or guid', () => {
  function open(copyResult: object) {
    const toast = vi.fn();

    TestBed.configureTestingModule({
      declarations: [CopyingListComponent],
      providers: [
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: Router, useValue: { events: EMPTY } },
        { provide: ModalService, useValue: { open: () => of(copyResult) } },
        { provide: NotificationService, useValue: { toast } }
      ]
    });

    const component = TestBed.createComponent(CopyingListComponent).componentInstance;
    component.ngOnInit();
    component.selectedRows$.subscribe();

    return { component, toast };
  }

  it('sends no copy when the copy window had no season to copy into', () => {
    const { component, toast } = open({ copy: true, season: null, identities: ['a'] });

    component.promptCopyModal('Sponsor');

    expect(component.copied).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('copies into the season the copy window chose', () => {
    const { component } = open({ copy: true, season: { guid: 'season-2026', year: 2026 }, identities: ['a'] });

    component.promptCopyModal('Sponsor');

    expect(component.copied).toHaveBeenCalledWith('season-2026', ['a']);
  });

  it('deletes nothing for a row with no guid', () => {
    const { component } = open({});

    component.deleteEntity({});

    expect(component.deleted).not.toHaveBeenCalled();
  });

  it('selects only the rows that have a guid', async () => {
    const { component } = open({});

    component.toggleAllRows([{ guid: 'a' }, {}, { guid: 'b' }]);

    await expect(firstValueFrom(component.selectedRows$)).resolves.toEqual(['a', 'b']);
  });
});
