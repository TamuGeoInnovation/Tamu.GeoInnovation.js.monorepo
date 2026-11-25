import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom, NEVER, Observable, of } from 'rxjs';

import { GuidIdentity } from '@tamu-gisc/gisday/platform/data-api';
import { BaseService, JudgingService, SeasonService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LINE_CHART_DRAWER } from '@tamu-gisc/ui-kits/ngx/charts';

import { BaseAdminListComponent } from './base-admin-list/base-admin-list.component';
import { RubricsComponent } from './research-competition/pages/rubrics/rubrics.component';
import { AccountDashboardComponent } from './dashboards/account-dashboard/account-dashboard.component';

@Component({ template: '', standalone: false })
class ThingListComponent extends BaseAdminListComponent<GuidIdentity> {
  protected readonly entityService = {
    getEntities: () => of([]),
    getEntitiesForActiveSeason: () => of([]),
    getEntitiesForSeason: () => of([])
  } as unknown as BaseService<GuidIdentity>;
}

const seasons = [
  { guid: 's-2026', year: 2026 },
  { guid: 's-2025', year: 2025 }
];

/**
 * How each kind of admin page picks its season (#3329): an admin list, a judging page and a dashboard. Each shows the
 * season named in the address, puts the season chosen there so a reload keeps it, and shows none on a site with no
 * season (#2076). The judging pages kept the choice in a signal only, so a reload lost it: red on today's code.
 */
const pages: Array<{
  name: string;
  page: Type<unknown>;
  shown: (page: unknown) => Promise<{ guid?: string } | null>;
  choose: (page: unknown, guid: string) => void;
}> = [
  {
    name: 'an admin list',
    page: ThingListComponent,
    shown: (page) => firstValueFrom((page as ThingListComponent).selectedSeason$ as Observable<{ guid?: string } | null>),
    choose: (page, guid) => (page as ThingListComponent).setSeason(guid)
  },
  {
    name: 'the Rubrics page',
    page: RubricsComponent,
    shown: async (page) => (page as RubricsComponent).choice.season(),
    choose: (page, guid) => (page as RubricsComponent).choice.choose(guid)
  },
  {
    name: 'the account dashboard',
    page: AccountDashboardComponent,
    shown: (page) =>
      firstValueFrom((page as AccountDashboardComponent).selectedSeason$ as Observable<{ guid?: string } | null>),
    choose: (page, guid) => (page as AccountDashboardComponent).setSeason(guid)
  }
];

describe.each(pages)('picking the season on $name (#3329)', ({ page, shown, choose }) => {
  async function open(url: string, withSeasons = true) {
    TestBed.configureTestingModule({
      declarations: [ThingListComponent],
      providers: [
        provideRouter([{ path: 'page', component: page }]),
        {
          provide: SeasonService,
          useValue: {
            seasons$: of(withSeasons ? seasons : []),
            activeSeason$: of(withSeasons ? seasons[0] : null)
          }
        },
        { provide: JudgingService, useValue: { rubrics: () => of([]) } },
        { provide: UserService, useValue: { getDashboardForSeason: () => NEVER, getDashboardRow: () => NEVER } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: LINE_CHART_DRAWER, useValue: () => Promise.resolve(() => undefined) }
      ]
    });

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(url, page);
    harness.detectChanges();
    await harness.fixture.whenStable();

    return { harness, component };
  }

  it('shows the active season when the address names none', async () => {
    const { component } = await open('/page');

    expect((await shown(component))?.guid).toBe('s-2026');
  });

  it('shows the season the address names, so a reload keeps the choice', async () => {
    const { component } = await open('/page?season=s-2025');

    expect((await shown(component))?.guid).toBe('s-2025');
  });

  it('puts the season chosen in the address', async () => {
    const { harness, component } = await open('/page');

    choose(component, 's-2025');
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/page?season=s-2025');
    expect((await shown(component))?.guid).toBe('s-2025');
  });

  it('shows no season on a site that has none', async () => {
    const { component } = await open('/page', false);

    expect((await shown(component)) ?? null).toBeNull();
  });
});
