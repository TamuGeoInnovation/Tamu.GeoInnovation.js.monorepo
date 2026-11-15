import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { TagService } from './tag.service';

/** #3033: the sessions that have a tag, for its admin page. */
describe('TagService.getSessions()', () => {
  it("reads the tag's sessions from its admin route", () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    const http = TestBed.inject(HttpTestingController);

    TestBed.inject(TagService).getSessions('t-1').subscribe();
    http.expectOne({ method: 'GET', url: 'api/tags/t-1/sessions' }).flush([]);
    http.verify();
  });
});
