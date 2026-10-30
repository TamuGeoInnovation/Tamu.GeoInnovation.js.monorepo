import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerConnectionService } from './trip-planner-connection.service';

const ROUTING = 'https://gis.example.edu/arcgis/rest/services/Routing';
const DEVELOPMENT_ROUTING = 'https://gis-dev.example.edu/arcgis/rest/services/RoutingProPublish';

const SUPPORTED = [
  { id: '1', name: 'Bike', type: 'AUTOMOBILE' },
  { id: '4', name: 'Walk', type: 'WALK' }
];

describe('TripPlannerConnectionService', () => {
  let http: HttpTestingController;
  let isTesting: boolean;

  beforeEach(() => {
    isTesting = false;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: EnvironmentService,
          useValue: { value: () => ({ routingBaseUrl: ROUTING, developmentRoutingBaseUrl: DEVELOPMENT_ROUTING }) }
        },
        { provide: TestingService, useValue: { get isTesting() { return isTesting; } } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Creates the service, which asks the server for its routing networks at once, and answers with these. */
  const answeredWith = (services: Array<{ name: string; type: string }>) => {
    const service = TestBed.inject(TripPlannerConnectionService);
    http.expectOne(`${ROUTING}?f=pjson`).flush({ services });

    return service;
  };

  // Routing is unpublished on the production GIS server (#1003): its Routing folder lists nothing. The service is
  // created by every popup that can offer directions, so every one of them logged "Cannot read properties of
  // undefined (reading 'name')" (#2259).
  it('has no network to connect to when the server publishes none, and says nothing', async () => {
    const service = answeredWith([]);

    expect(() => service.connection()).not.toThrow();
    expect(service.connection()).toBeUndefined();
    expect((await firstValueFrom(service.currentNetwork)).name).toBe('');
  });

  it('connects to the latest published network', async () => {
    const service = answeredWith([
      { name: 'Routing/20210801', type: 'NAServer' },
      { name: 'Routing/20220119', type: 'NAServer' },
      { name: 'Routing/20220119', type: 'MapServer' },
      { name: 'Routing/ChrisRoutingTest', type: 'NAServer' }
    ]);

    const route = 'https://gis.example.edu/arcgis/rest/services/Routing/20220119/NAServer/Route';

    expect(service.connection().url()).toBe(route);
    expect((await firstValueFrom(service.currentNetwork)).name).toBe('Routing/20220119');

    // It then asks that network what it can solve.
    http.expectOne(`${route}?f=json`).flush({ supportedTravelModes: SUPPORTED });
    expect(await firstValueFrom(service.supportedTravelModes)).toEqual(SUPPORTED);
  });

  // RoutingProPublish/Map is the network the Transportation GIS team published for #659. It is not under the
  // dated `Routing/yyyymmdd` names discovery looks for, and is on the development server only.
  describe('where development-only features are on', () => {
    beforeEach(() => {
      isTesting = true;
    });

    it('connects to the published network without discovering anything', async () => {
      const service = TestBed.inject(TripPlannerConnectionService);
      const route = `${DEVELOPMENT_ROUTING}/Map/NAServer/Route`;

      http.expectNone(`${ROUTING}?f=pjson`);
      http.expectOne(`${route}?f=json`).flush({ supportedTravelModes: SUPPORTED });

      expect(service.connection().url()).toBe(route);
      expect((await firstValueFrom(service.currentNetwork)).name).toBe('RoutingProPublish/Map');
    });

    it('says what the network can solve, read from the network', async () => {
      const service = TestBed.inject(TripPlannerConnectionService);

      expect(await firstValueFrom(service.supportedTravelModes)).toBeNull();

      http.expectOne(`${DEVELOPMENT_ROUTING}/Map/NAServer/Route?f=json`).flush({ supportedTravelModes: SUPPORTED });

      expect(await firstValueFrom(service.supportedTravelModes)).toEqual(SUPPORTED);
    });

    it('offers no mode, rather than every one, when the network cannot say what it solves', async () => {
      const service = TestBed.inject(TripPlannerConnectionService);

      http
        .expectOne(`${DEVELOPMENT_ROUTING}/Map/NAServer/Route?f=json`)
        .flush('down', { status: 503, statusText: 'Service Unavailable' });

      expect(await firstValueFrom(service.supportedTravelModes)).toEqual([]);
    });
  });

  it('does not touch the development-only network where development-only features are off', () => {
    answeredWith([]);

    http.expectNone((request) => request.url.includes('RoutingProPublish'));
  });
});
