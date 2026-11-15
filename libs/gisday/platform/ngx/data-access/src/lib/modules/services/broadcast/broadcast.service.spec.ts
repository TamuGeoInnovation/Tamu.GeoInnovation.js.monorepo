import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BroadcastService } from './broadcast.service';

/** #3032: the sessions that use a broadcast, for its admin page. */
describe('BroadcastService.getSessions()', () => {
  it("reads the broadcast's sessions from its admin route", () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    const http = TestBed.inject(HttpTestingController);

    TestBed.inject(BroadcastService).getSessions('b-1').subscribe();
    http.expectOne({ method: 'GET', url: 'api/event-broadcasts/b-1/sessions' }).flush([]);
    http.verify();
  });
});
