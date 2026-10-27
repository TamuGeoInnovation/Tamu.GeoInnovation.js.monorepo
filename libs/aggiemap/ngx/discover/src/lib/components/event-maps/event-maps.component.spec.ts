import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { discoverRoutes } from '../../discover.routes';
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
    getVisibleInternalDiscoverApplications: () => [],
    getInternalDiscoverApplications: () => []
  };

  const render = async (data: Record<string, unknown>): Promise<ComponentFixture<EventMapsComponent>> => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, EventMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: ActivatedRoute, useValue: { snapshot: { data } } },
        { provide: TestingService, useValue: { isTesting: false, get: () => of(false) } }
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

    expect(fixture.componentInstance.quickLinks.map((link) => link.label)).toEqual([
      'Campus Main Parking',
      'Visitor Parking'
    ]);
    expect(fixture.nativeElement.querySelector('tamu-gisc-quick-links')).not.toBeNull();
  });
});

/**
 * A category page lists the development-only maps of its type on development, and none of them on
 * production (#2449).
 *
 * This page took `getVisibleInternalDiscoverApplications()`, which drops `visible: false` whatever the
 * environment - so the two campuses added with that flag were listed nowhere, including the
 * development site they were added for. Rendered rather than asserted on the field, because what was
 * wrong was which list the component asked for.
 */
describe('EventMapsComponent development-only maps', () => {
  const published = { name: 'Galveston', id: 'galveston', type: 'satellite-campus', mapTypes: ['campus'] };
  const developmentOnly = {
    name: 'Fort Worth Law School',
    id: 'fort-worth-law',
    type: 'satellite-campus',
    mapTypes: ['campus'],
    visible: false
  };

  const discoveryStub = {
    getQuickLinkApplications: () => [],
    getVisibleInternalDiscoverApplications: () => [published],
    getInternalDiscoverApplications: () => [published, developmentOnly]
  };

  const listed = async (isTesting: boolean): Promise<string[]> => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, EventMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { mapType: 'campus', title: 'Campus Maps' } } } },
        { provide: TestingService, useValue: { isTesting, get: () => of(isTesting) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(EventMapsComponent);

    fixture.detectChanges();

    return (fixture.componentInstance.applications ?? []).map((app) => app.name);
  };

  afterEach(() => TestBed.resetTestingModule());

  it('lists a development-only map on development', async () => {
    expect(await listed(true)).toEqual(['Fort Worth Law School', 'Galveston']);
  });

  it('does not list it on production', async () => {
    // Checked from both sides: a page that listed nothing would pass the test above on its own.
    expect(await listed(false)).toEqual(['Galveston']);
  });

  it('takes its maps from the unfiltered list, so the environment decides and not the list', () => {
    // The regression was asking the service for the already-filtered list. Asserted directly because a
    // component that went back to it would still pass the test above on a development host.
    const source = EventMapsComponent.prototype.ngOnInit.toString();

    expect(source).toContain('getInternalDiscoverApplications');
    expect(source).not.toContain('getVisibleInternalDiscoverApplications');
  });
});

describe('All Maps routes', () => {
  it('turn the quick links off on the Campus Maps page, and only there', () => {
    const withoutQuickLinks = discoverRoutes
      .filter((route) => route.data?.['quickLinks'] === false)
      .map((route) => route.path);

    expect(withoutQuickLinks).toEqual(['campus']);
  });

  it('hide the Main Campus Parking Map button on the Campus Maps page, and only there', () => {
    const withoutButton = discoverRoutes.filter((route) => route.data?.['mainParking'] === false).map((route) => route.path);

    expect(withoutButton).toEqual(['campus']);
  });
});
