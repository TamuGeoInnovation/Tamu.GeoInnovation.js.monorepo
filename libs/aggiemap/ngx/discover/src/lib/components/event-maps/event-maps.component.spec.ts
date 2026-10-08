import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { discoverRoutes } from '../../discover.module';
import { EventMapsComponent } from './event-maps.component';

/**
 * The Campus Maps page carries no College Station quick links or Main Campus Parking Map button (#1291).
 *
 * Every All Maps category page is this one component, configured by its route's `data`. The quick links
 * are College Station's most-used parking maps, which belong on College Station's pages and not on the
 * page for the other campuses. A category turns them off with `quickLinks: false`.
 */
describe('EventMapsComponent quick links', () => {
  const quickLinkApps = [
    { name: 'Campus Main Parking', type: 'parking', id: 'ts-main-parking' },
    { name: 'Visitor Parking', type: 'parking', id: 'visitor-parking' }
  ];

  const discoveryStub = {
    getQuickLinkApplications: () => quickLinkApps,
    getVisibleInternalDiscoverApplications: () => []
  };

  const render = async (data: Record<string, unknown>): Promise<ComponentFixture<EventMapsComponent>> => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, EventMapsComponent],
    providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: ActivatedRoute, useValue: { snapshot: { data } } }
    ],
    schemas: [NO_ERRORS_SCHEMA]
}).compileComponents();

    const fixture = TestBed.createComponent(EventMapsComponent);

    fixture.detectChanges();

    return fixture;
  };

  afterEach(() => TestBed.resetTestingModule());

  it('shows no quick links on the Campus Maps page', async () => {
    const fixture = await render({ mapType: 'satellite-campus', title: 'Campus Maps', quickLinks: false });

    expect(fixture.componentInstance.quickLinks).toEqual([]);
    expect(fixture.nativeElement.querySelector('tamu-gisc-quick-links')).toBeNull();
  });

  it('hides the Main Campus Parking Map button on the Campus Maps page', async () => {
    const fixture = await render({ mapType: 'satellite-campus', title: 'Campus Maps', mainParking: false });

    expect(fixture.componentInstance.showMainParking).toBe(false);
  });

  it('still shows the Main Campus Parking Map button on a College Station category page', async () => {
    const fixture = await render({ mapType: 'campus', title: 'Campus Events' });

    expect(fixture.componentInstance.showMainParking).toBe(true);
  });

  it('still shows them on a College Station category page', async () => {
    // Both directions: a check that only proved them absent would pass just as well if the quick links
    // had stopped working everywhere.
    const fixture = await render({ mapType: 'campus', title: 'Campus Events' });

    expect(fixture.componentInstance.quickLinks.map((link) => link.label)).toEqual(['Campus Main Parking', 'Visitor Parking']);
    expect(fixture.nativeElement.querySelector('tamu-gisc-quick-links')).not.toBeNull();
  });
});

describe('All Maps routes', () => {
  it('turn the quick links off on the Campus Maps page, and only there', () => {
    const withoutQuickLinks = discoverRoutes.filter((route) => route.data?.['quickLinks'] === false).map((route) => route.path);

    expect(withoutQuickLinks).toEqual(['campus']);
  });

  it('hide the Main Campus Parking Map button on the Campus Maps page, and only there', () => {
    const withoutButton = discoverRoutes.filter((route) => route.data?.['mainParking'] === false).map((route) => route.path);

    expect(withoutButton).toEqual(['campus']);
  });
});
