import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { TripPlannerConnectionService } from './trip-planner-connection.service';

const ROUTING = 'https://gis.example.edu/arcgis/rest/services/Routing';

describe('TripPlannerConnectionService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => ({ routingBaseUrl: ROUTING }) } }
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

    expect(service.connection().url()).toBe('https://gis.example.edu/arcgis/rest/services/Routing/20220119/NAServer/Route');
    expect((await firstValueFrom(service.currentNetwork)).name).toBe('Routing/20220119');
  });
});
