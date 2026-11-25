import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BroadcastService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GISDAY_SITES, type GisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { BroadcastListComponent } from './broadcast-list.component';

/**
 * #3048. gisday.tamu.edu shares txgisday.org's database, and its Admin > Broadcasts listed every organization's Zooms:
 * TTU's, UT's and SWIGGIS's beside Texas A&M's. A broadcast now has a place, and the list starts with the site's own, as
 * the admin Sessions list does (#2986), with a switch to show every organization's.
 */
describe('BroadcastListComponent', () => {
  const tamu = { guid: 'tamu', name: 'Texas A&M University GIS Day(s)' };
  const ttu = { guid: 'ttu', name: 'Texas Tech University GIS Day' };
  const broadcasts = [
    { guid: 'b-tamu', name: 'TAMU Zoom 1', place: tamu },
    { guid: 'b-ttu', name: 'TTU 1', place: ttu },
    { guid: 'b-none', name: 'Unplaced Zoom', place: null }
  ];

  function open(site: GisdaySite = GISDAY_SITES.tamu) {
    TestBed.configureTestingModule({
      imports: [BroadcastListComponent],
      providers: [
        provideRouter([]),
        { provide: GISDAY_SITE, useValue: site },
        {
          provide: BroadcastService,
          useValue: {
            getEntities: () => of(broadcasts),
            getEntitiesForActiveSeason: () => of(broadcasts),
            getEntitiesForSeason: () => of(broadcasts)
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: vi.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(BroadcastListComponent);
    fixture.detectChanges();

    const rows = () => {
      fixture.detectChanges();

      return [...(fixture.nativeElement as HTMLElement).querySelectorAll('tr.selectable')].map((row) =>
        row.textContent.trim()
      );
    };

    return { fixture, rows, page: fixture.nativeElement as HTMLElement };
  }

  it("lists only the site's own broadcasts on gisday.tamu.edu, and those with no place yet", () => {
    const { rows } = open();

    expect(rows().join('|')).toContain('TAMU Zoom 1');
    expect(rows().join('|')).toContain('Unplaced Zoom');
    expect(rows().join('|')).not.toContain('TTU 1');
  });

  it("shows every organization's broadcasts when switched", () => {
    const { fixture, rows, page } = open();

    expect(page.textContent).toContain("Show every organization's broadcasts");

    fixture.componentInstance.organizations.setValue('all');

    expect(rows().join('|')).toContain('TTU 1');
  });

  it("names each broadcast's organization", () => {
    const { rows } = open();

    expect(rows().find((row) => row.includes('TAMU Zoom 1'))).toContain(tamu.name);
  });

  it("lists every organization's broadcasts on txgisday.org, with no switch", () => {
    const { rows, page } = open(GISDAY_SITES.txgisday);

    expect(rows()).toHaveLength(3);
    expect(page.textContent).not.toContain("Show every organization's broadcasts");
  });
});
