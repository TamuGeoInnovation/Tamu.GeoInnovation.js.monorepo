import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { MapColumnGroup } from '../discover.utils';
import { DiscoveryService } from '../../services/discovery/discovery.service';
import { discoveryServiceStub } from '../../services/discovery/discovery.service.stub';
import { ParkingMapsComponent } from './parking-maps.component';

/**
 * The Parking & Transportation page lists a development-only map on development, like every other listing page
 * (#2449, #3470).
 *
 * This page asked the service for the production-only list, so a map with `visible: false` - which is how a
 * `developmentOnly` map arrives (#2712) - was hidden on development as well as production, and appeared nowhere. It is
 * the bug #2449 fixed on the category pages, latent here only because no development-only parking map exists yet. A
 * check that waits for one to be added is a check that is written after the fault is reported.
 */
describe('ParkingMapsComponent development-only maps', () => {
  const published = {
    name: 'Visitor Parking',
    id: 'visitor-parking',
    type: 'parking',
    mapTypes: ['parking'],
    parkingCategory: 'general'
  };
  const developmentOnly = {
    name: 'New Garage Parking',
    id: 'new-garage-parking',
    type: 'parking',
    mapTypes: ['parking'],
    parkingCategory: 'general',
    visible: false
  };
  const developmentOnlyTransportation = {
    name: 'New Shuttle',
    id: 'new-shuttle',
    type: 'parking',
    mapTypes: ['transportation'],
    visible: false
  };

  const discoveryStub = discoveryServiceStub({
    getInternalDiscoverApplications: () => [published, developmentOnly, developmentOnlyTransportation]
  });

  const namesIn = (columns: MapColumnGroup[]): string[] =>
    columns.flatMap((column) => column.applications.map((app) => app.name));

  const render = async (isTesting: boolean) => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ParkingMapsComponent],
      providers: [
        { provide: DiscoveryService, useValue: discoveryStub },
        { provide: TestingService, useValue: { isTesting, get: () => of(isTesting) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(ParkingMapsComponent);

    fixture.detectChanges();

    return fixture.componentInstance;
  };

  afterEach(() => TestBed.resetTestingModule());

  it('lists a development-only parking map on development', async () => {
    const component = await render(true);

    expect(namesIn(component.columns)).toEqual(['New Garage Parking', 'Visitor Parking']);
  });

  it('does not list it on production', async () => {
    // Checked from both sides: a page that listed nothing would pass the test above on its own.
    const component = await render(false);

    expect(namesIn(component.columns)).toEqual(['Visitor Parking']);
  });

  it('lists a development-only transportation map on development too', async () => {
    const development = await render(true);

    expect(namesIn(development.transportationColumns)).toEqual(['New Shuttle']);

    // One module per render, so the second one starts clean.
    TestBed.resetTestingModule();

    const production = await render(false);

    expect(namesIn(production.transportationColumns)).toEqual([]);
  });
});
