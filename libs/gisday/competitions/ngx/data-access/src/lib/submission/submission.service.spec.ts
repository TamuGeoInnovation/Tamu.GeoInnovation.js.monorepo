import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SubmissionService } from './submission.service';

describe('SubmissionService', () => {
  let service: SubmissionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SubmissionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("reads the VGI dashboard's season and a feature type's submitters from their admin routes (#2894)", () => {
    service.getDashboardForSeason('season-1').subscribe();
    http
      .expectOne({ method: 'GET', url: 'api/competitions/submissions/dashboard/season/season-1' })
      .flush({ season: 'season-1', people: 0, events: [], made: [], unreadAccounts: 0 });

    service.getDashboardForType('season-1', 'war memorial').subscribe();
    http
      .expectOne({ method: 'GET', url: 'api/competitions/submissions/dashboard/season/season-1/type/war%20memorial' })
      .flush([]);
  });
});
