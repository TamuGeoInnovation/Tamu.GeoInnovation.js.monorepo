import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { TripPlannerService } from './trip-planner.service';
import { TripPlannerConnectionService } from './trip-planner-connection.service';
import { BusService } from './transportation/bus/bus.service';
import { BikeService } from './transportation/bike/bike.service';
import { ParkingService } from './transportation/drive/parking.service';
import { TripResult } from '../core/trip-planner-core';
import { TripPlannerDirectionsComponent } from '../components/trip-planner-directions/containers/base/base.component';
import { TripPlannerDirectionsActionsComponent } from '../components/trip-planner-directions-actions/containers/base/base.component';

/**
 * #3487. Five components each ran the trip result's pipe, and the service's pipe ends by drawing the route, so every
 * subscriber drew it again on every change: with the directions open on a phone, three or four times per trip.
 * Whatever the number of components showing the result, it is drawn once per change.
 */
describe('TripPlannerService, the current trip result', () => {
  let service: TripPlannerService;
  let drawn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        // The service's own work at start - settings, the map, the routing network - waits on these, so nothing runs
        // but what the test pushes.
        { provide: EnvironmentService, useValue: { value: () => undefined } },
        { provide: SettingsService, useValue: { init: () => NEVER } },
        { provide: EsriModuleProviderService, useValue: { require: () => NEVER } },
        { provide: EsriMapService, useValue: { store: NEVER } },
        { provide: TripPlannerConnectionService, useValue: { currentNetwork: NEVER, supportedTravelModes: NEVER } },
        { provide: Angulartics2, useValue: { eventTrack: new Subject() } },
        { provide: NotificationService, useValue: {} },
        { provide: SearchService, useValue: {} },
        { provide: BusService, useValue: {} },
        { provide: BikeService, useValue: {} },
        { provide: ParkingService, useValue: {} }
      ]
    });
    TestBed.overrideTemplate(TripPlannerDirectionsComponent, '');
    TestBed.overrideTemplate(TripPlannerDirectionsActionsComponent, '');

    service = TestBed.inject(TripPlannerService);
    drawn = vi.spyOn(service, 'drawRoute').mockImplementation((result: TripResult) => result);

    // A travel mode, as the settings give one before anything is shown.
    service['_TravelOptions'].next({ travel_mode: 1 });

    // Three components showing the result at once, as the directions page has.
    TestBed.createComponent(TripPlannerDirectionsComponent).detectChanges();
    TestBed.createComponent(TripPlannerDirectionsComponent).detectChanges();
    TestBed.createComponent(TripPlannerDirectionsActionsComponent).detectChanges();

    drawn.mockClear();
  });

  it('draws the route once when the travel mode changes', () => {
    service['_TravelOptions'].next({ travel_mode: 2 });

    expect(drawn).toHaveBeenCalledTimes(1);
  });

  it('draws the route once when a new trip result arrives', () => {
    service['_Result'].next([new TripResult({})]);

    expect(drawn).toHaveBeenCalledTimes(1);
  });
});
