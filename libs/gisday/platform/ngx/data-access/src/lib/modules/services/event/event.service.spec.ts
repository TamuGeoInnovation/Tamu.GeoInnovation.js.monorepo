import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { EventService } from './event.service';

/**
 * Regression coverage (#3558). The API sends a session's dates, and its day's, as ISO text while the types say
 * `Date`. The service hands a page Dates, as the types say.
 */
describe('EventService', () => {
  let service: EventService;
  let http: HttpTestingController;

  const wire = {
    guid: 'e-1',
    name: 'Flood maps',
    startTime: '14:00:00',
    endTime: '14:40:00',
    created: '2026-10-01T15:00:00.000Z',
    updated: '2026-11-02T16:30:00.000Z',
    day: { guid: 'd-1', date: '2026-11-16T06:00:00.000Z' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it("gives a session's dates as Dates, and leaves the rest as it came", async () => {
    const result = firstValueFrom(service.getEvent('e-1'));

    http.expectOne('api/events/e-1').flush(wire);

    const session = await result;

    expect(session.day?.date).toEqual(new Date('2026-11-16T06:00:00.000Z'));
    expect(session.created).toEqual(new Date('2026-10-01T15:00:00.000Z'));
    expect(session.updated).toEqual(new Date('2026-11-02T16:30:00.000Z'));
    expect(session.startTime).toBe('14:00:00');
    expect(session.name).toBe('Flood maps');
  });

  it("gives the active season's sessions' days as Dates", async () => {
    const result = firstValueFrom(service.getEntitiesForActiveSeason());

    http.expectOne('api/events/season/active').flush([wire]);

    expect((await result)[0].day?.date).toEqual(new Date('2026-11-16T06:00:00.000Z'));
  });

  it('gives the sessions by day with their days as Dates', async () => {
    const result = firstValueFrom(service.getEventsByDay());

    http.expectOne('api/events/by-day').flush({ day0: [wire], day1: [], day2: [] });

    expect((await result).day0?.[0].day?.date).toEqual(new Date('2026-11-16T06:00:00.000Z'));
  });
});
