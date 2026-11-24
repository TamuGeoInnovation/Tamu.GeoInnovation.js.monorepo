import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SessionFilesService } from './session-files.service';

describe('SessionFilesService', () => {
  let service: SessionFilesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SessionFilesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("removes any speaker's file from a session through the admins' route (#3105)", () => {
    service.removeFromEvent('event-1', 'file-1').subscribe();

    http.expectOne({ method: 'DELETE', url: 'api/session-files/event/event-1/file-1' }).flush(null, {
      status: 204,
      statusText: 'No Content'
    });
  });
});
