import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SeasonDayService } from './season-day.service';

/**
 * Regression coverage (#3558). The API sends a day's date, and its sessions' days, as ISO text while the types say
 * `Date`. The service hands a page Dates, as the types say.
 */
describe('SeasonDayService', () => {
  let service: SeasonDayService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SeasonDayService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it("gives a day's date as a Date", async () => {
    const result = firstValueFrom(service.getEntity('d-1'));

    http.expectOne('api/season-days/d-1').flush({ guid: 'd-1', date: '2026-11-16T06:00:00.000Z' });

    expect((await result).date).toEqual(new Date('2026-11-16T06:00:00.000Z'));
  });

  it("gives the dates of a day's sessions as Dates, and leaves their times of day as text", async () => {
    const result = firstValueFrom(service.getDayEvents('d-1'));

    http.expectOne('api/season-days/d-1/events').flush([
      {
        guid: 'e-1',
        startTime: '14:00:00',
        created: '2026-10-01T15:00:00.000Z',
        day: { guid: 'd-1', date: '2026-11-16T06:00:00.000Z' }
      }
    ]);

    const [session] = await result;

    expect(session.day?.date).toEqual(new Date('2026-11-16T06:00:00.000Z'));
    expect(session.created).toEqual(new Date('2026-10-01T15:00:00.000Z'));
    expect(session.startTime).toBe('14:00:00');
  });
});
