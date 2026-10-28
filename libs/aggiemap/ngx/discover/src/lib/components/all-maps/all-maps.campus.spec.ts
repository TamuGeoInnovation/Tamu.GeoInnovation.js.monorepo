import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2 } from 'angulartics2';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { LastMapService } from '@tamu-gisc/aggiemap/ngx/common';
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

  // A campus still being checked, listed on development alone (#2437, #2438). The component's filter
  // is what this exercises; that the real Fort Worth Law School and Houston Space Institute carry
  // `visible: false` is asserted where their definitions are imported.
  const developmentOnlyCampus = {
    ...{
      name: 'Fort Worth Law School',
      id: 'fort-worth-law',
      source: 'internal',
      type: 'satellite-campus',
      mapTypes: ['campus'],
      thumbnail: './assets/images/campus/fort-worth-law.jpg',
      description: 'Map of the Texas A&M University School of Law campus in Fort Worth.',
      configuration: { id: 'fort-worth-law', eventDates: [] }
    },
    visible: false
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
    getInternalDiscoverApplications: () => [campus, developmentOnlyCampus],
    getVisibleInternalDiscoverApplications: () => [],
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => [campus, developmentOnlyCampus],
    getKioskDiscoverApplications: () => [kiosk],
    getQuickLinkApplications: () => [],
    getParkingApplicationsByCategory: () => []
  };

  const componentAs = async (isDev: boolean): Promise<ComponentFixture<AllMapsComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
      providers: [
        // A standalone AllMapsComponent brings its real children, one of which injects Angulartics2;
        // mocked rather than importing the real module, matching bus-list.component.spec.ts.
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
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

  // Fort Worth Law School and the Houston Space Institute carry `visible: false` while the GIS team's
  // data is still being checked (#2437, #2438). The gate is one filter in the component, which is
  // exactly the kind of thing a later edit removes without anyone noticing, so it is pinned here -
  // from both sides, because a check that only ran on production would pass just as well if the
  // campuses had been deleted outright.
  const DEVELOPMENT_ONLY_CAMPUSES = [developmentOnlyCampus.name];

  const campusNames = (element: HTMLElement): string[] =>
    Array.from(element.querySelectorAll('.campus-tile-label')).map((label) => (label.textContent ?? '').trim());

  it('does not list a development-only campus on production', async () => {
    const listed = campusNames(await renderAs(false));

    for (const campus of DEVELOPMENT_ONLY_CAMPUSES) {
      expect(listed, `${campus} is listed on an environment that should not have it`).not.toContain(campus);
    }

    // A campus that is on production stays there, so the gate hides only what it should.
    expect(listed).toContain('Galveston');
  });

  it('lists a development-only campus on development', async () => {
    const listed = campusNames(await renderAs(true));

    for (const campus of DEVELOPMENT_ONLY_CAMPUSES) {
      expect(listed, `${campus} should be listed on development`).toContain(campus);
    }

    expect(listed).toContain('Galveston');
  });

  it('puts each campus name before its picture, so a name is read before the map it belongs to', async () => {
    const element = await renderAs(false);
    const tiles = Array.from(element.querySelectorAll('.campus-maps-section .campus-tile'));
    const pictured = tiles.filter((tile) => tile.querySelector('img.map-entry-thumbnail') !== null);

    expect(pictured.length).toBeGreaterThan(0);

    for (const tile of pictured) {
      const label = tile.querySelector('.campus-tile-label') as HTMLElement;
      const image = tile.querySelector('img.map-entry-thumbnail') as HTMLElement;

      expect(label.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
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
