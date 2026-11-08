import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { BUS_ROUTES_URL, BusService, routeStopFields } from './bus.service';

const VIEW = 'https://gis.dev.tamu.edu/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer';

/**
 * Route 47 as production's `Hosted/Bus_Routes_view` answered on 8 November 2026, its stops only. The service returns the
 * fields in no particular order, as here, and production's view has a `stop32` that development's does not.
 */
const ROUTE_47 = {
  stop30: '30. Lot 71',
  routenum: '47',
  stop10: '10. Equine Center - Outbound',
  stop2: '2. Fish Pond - South',
  stop32: '32. Wehner - Inbound',
  stop1: '1. MSC',
  stop31: '31. Vet School - Inbound',
  stop9: '9. Turf Lab - Outbound',
  stop11: null,
  routename: 'RELLIS'
};

/**
 * The bus map reads Transportation's hosted view, whose field names are lower case (#2636). It used to read
 * `TS/Bus_Routes` on the development server, pinned there on every environment, with mixed-case names that the view
 * answers with an error: "Field name 'RouteNum' does not exist".
 */
describe('BusService', () => {
  let http: HttpTestingController;

  function create(url?: string): BusService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(url ? [{ provide: BUS_ROUTES_URL, useValue: url }] : []),
        // The map never loads here, so the service draws nothing and only its queries are exercised.
        { provide: EsriMapService, useValue: { store: new Promise(() => undefined) } },
        { provide: EsriModuleProviderService, useValue: {} },
        { provide: Location, useValue: {} },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } }
      ]
    });
    http = TestBed.inject(HttpTestingController);

    return TestBed.inject(BusService);
  }

  afterEach(() => http.verify());

  it("reads the routes from the environment's own view, by its lower-case field names", async () => {
    const routes = firstValueFrom(create(VIEW).getRoutes());

    const query = http.expectOne((request) => request.url.startsWith(`${VIEW}/1/query?`));
    expect(new URL(query.request.url).searchParams.get('outFields')).toBe('routenum,routename,campus');
    query.flush({
      features: [
        { attributes: { campus: 'Off', routename: 'Reveille', routenum: '12' } },
        { attributes: { campus: 'On', routename: 'Bonfire', routenum: '01' } }
      ]
    });
    http.expectOne(`${VIEW}/1?f=json`).flush({
      drawingInfo: {
        renderer: {
          uniqueValueInfos: [
            { value: '01', symbol: { color: [214, 68, 39, 255] } },
            { value: '12', symbol: { color: [44, 95, 165, 255] } }
          ]
        }
      }
    });

    expect((await routes).map((route) => [route.ShortName, route.Name, route.Group.Name, route.Color])).toEqual([
      ['12', 'Reveille', 'Off Campus', 'rgb(44,95,165)'],
      ['01', 'Bonfire', 'On Campus', 'rgb(214,68,39)']
    ]);
  });

  it("reads production's view where the application names none", () => {
    create().getRoutes().subscribe();

    const requests = http.match((request) =>
      request.url.startsWith('https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer/1')
    );
    expect(requests).toHaveLength(2);
    requests.forEach((request) => request.flush({}));
  });

  it("lists every one of a route's stops in order, however many fields the view has", async () => {
    const stops = firstValueFrom(create(VIEW).getRouteStops('47'));

    const query = http.expectOne((request) => request.url.startsWith(`${VIEW}/1/query?`));
    expect(new URL(query.request.url).searchParams.get('where')).toBe("routenum='47'");
    query.flush({ features: [{ attributes: ROUTE_47 }] });

    expect(await stops).toEqual([
      '1. MSC',
      '2. Fish Pond - South',
      '9. Turf Lab - Outbound',
      '10. Equine Center - Outbound',
      '30. Lot 71',
      '31. Vet School - Inbound',
      '32. Wehner - Inbound'
    ]);
  });

  it('takes only the stopN fields, numbered, as the stop fields', () => {
    expect(routeStopFields(ROUTE_47)).toEqual(['stop1', 'stop2', 'stop9', 'stop10', 'stop11', 'stop30', 'stop31', 'stop32']);
  });
});
