import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { LastMapService } from '../../services/last-map/last-map.service';
import { AllMapsComponent } from './all-maps.component';

/**
 * The satellite-campus maps are listed on production, not only on development (#1482).
 *
 * They were reachable in production by direct URL all along - the testing team used them - but
 * nothing there linked to them, so to everyone else they did not exist.
 *
 * Rendered rather than asserted on the component's fields, because what changed is the template: the
 * maps were always in `campusApplications` and it was the `@if` around the section that hid them. A
 * test reading the field would have passed before the fix and after it.
 */
describe('AllMapsComponent campus maps', () => {
  const campus = {
    name: 'Galveston',
    id: 'galveston',
    // `source` matters: the search exclusion is `source === 'internal' && type === 'satellite-campus'`,
    // so a stub without it is never excluded and the test fails against correct code.
    source: 'internal',
    type: 'satellite-campus',
    mapTypes: ['campus'],
    thumbnail: './assets/images/campus/galveston.jpg',
    description: 'Map of the Texas A&M University at Galveston campus.',
    configuration: { id: 'galveston', eventDates: [] }
  };

  const kiosk = {
    name: 'Dining',
    id: 'dining',
    source: 'internal',
    type: 'kiosk',
    mapTypes: ['campus'],
    configuration: { id: 'dining', eventDates: [] }
  };

  const discoveryStub = {
    getInternalDiscoverApplications: () => [campus],
    getVisibleInternalDiscoverApplications: () => [],
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => [campus],
    getKioskDiscoverApplications: () => [kiosk],
    getQuickLinkApplications: () => [],
    getParkingApplicationsByCategory: () => []
  };

  const componentAs = async (isDev: boolean): Promise<ComponentFixture<AllMapsComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(isDev) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AllMapsComponent);

    fixture.detectChanges();

    return fixture;
  };

  const renderAs = async (isDev: boolean): Promise<HTMLElement> => (await componentAs(isDev)).nativeElement;

  afterEach(() => TestBed.resetTestingModule());

  it('lists the Campus Maps section on production', async () => {
    const element = await renderAs(false);

    expect(element.querySelector('.campus-maps-section')).not.toBeNull();
    expect(element.querySelector('.campus-maps-section')?.textContent).toContain('Galveston');
  });

  it('offers the Campus Maps tile in Visit Maps on production', async () => {
    const element = await renderAs(false);
    const tile = Array.from(element.querySelectorAll('.visit-maps-tile')).find(
      (link) => link.getAttribute('aria-label') === 'Campus Maps'
    );

    expect(tile).toBeDefined();
  });

  it('keeps each campus card copyable, since the map search does not reach them', async () => {
    const element = await renderAs(false);

    expect(element.querySelector('.campus-maps-section tamu-gisc-copy-field')).not.toBeNull();
  });

  it('still leaves campus maps out of the map search, on production and on development', async () => {
    for (const isDev of [false, true]) {
      const fixture = await componentAs(isDev);

      // Searching the box for a campus by name finds nothing, because the list it searches is built
      // without them. `filteredApplications` debounces, so the emission is taken after the debounce
      // rather than whatever `startWith('')` produced first.
      await new Promise<void>((resolve) => {
        const emissions: unknown[][] = [];
        const subscription = fixture.componentInstance.filteredApplications.subscribe((apps) => emissions.push(apps));

        fixture.componentInstance.searchControl.setValue('Galveston');

        setTimeout(() => {
          subscription.unsubscribe();

          expect(emissions.length).toBeGreaterThan(0);
          expect(emissions[emissions.length - 1]).toEqual([]);
          resolve();
        }, 250);
      });

      TestBed.resetTestingModule();
    }
  }, 30_000);

  it('leaves the development-only Kiosk Maps section where it was', async () => {
    // The two sections sat behind the same gate. Taking the campus one out must not take this one
    // with it - a kiosk map is an embedding target, not something to offer a visitor.
    expect((await renderAs(false)).querySelector('.kiosk-maps-section')).toBeNull();

    TestBed.resetTestingModule();

    expect((await renderAs(true)).querySelector('.kiosk-maps-section')).not.toBeNull();
  });
});
