import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2 } from 'angulartics2';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { LastMapService } from '@tamu-gisc/aggiemap/ngx/common';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { AllMapsComponent } from './all-maps.component';

/**
 * The Campus Maps list is alphabetical (#2494). It showed campuses in registration order, which was
 * tolerable with three and not with ten. Rendered, because the order the visitor sees is the point.
 */
describe('AllMapsComponent campus map order', () => {
  // Deliberately not alphabetical: the order campuses were registered in.
  const REGISTRATION_ORDER = [
    'Galveston',
    'McAllen',
    'HSC Round Rock',
    'DC / Bush School',
    'Houston Space Institute',
    'HSC College of Dentistry',
    'Fort Worth Law School'
  ];

  const campuses = REGISTRATION_ORDER.map((name) => ({
    name,
    id: name.toLowerCase().replace(/[^a-z]+/g, '-'),
    source: 'internal',
    type: 'satellite-campus',
    mapTypes: ['campus'],
    thumbnail: './assets/images/campus/x.jpg',
    configuration: { id: name, eventDates: [] }
  }));

  const discoveryStub = {
    getInternalDiscoverApplications: () => campuses,
    getVisibleInternalDiscoverApplications: () => [],
    getExternalDiscoverApplications: () => [],
    getAllDiscoverApplications: () => campuses,
    getKioskDiscoverApplications: () => [],
    getQuickLinkApplications: () => [],
    getParkingApplicationsByCategory: () => []
  };

  afterEach(() => TestBed.resetTestingModule());

  it('lists the campuses alphabetically by name', async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
      providers: [
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { get: () => of(true) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AllMapsComponent);

    fixture.detectChanges();

    const listed = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.campus-tile-label')).map(
      (label) => (label.textContent ?? '').trim()
    );
    const alphabetical = [...REGISTRATION_ORDER].sort((a, b) => a.localeCompare(b));

    expect(listed).toEqual(alphabetical);
    expect(listed).not.toEqual(REGISTRATION_ORDER);
  });
});
