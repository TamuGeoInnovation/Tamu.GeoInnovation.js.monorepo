import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SpeakerService } from './speaker.service';

/**
 * Regression coverage (#2076). On a site with no season, `/speakers/participating` answers 404, and the
 * Presenters page showed nothing at all. With no season there are no presenters, so the page can say so.
 */
describe('SpeakerService.getParticipatingPresenters()', () => {
  let service: SpeakerService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: EnvironmentService, useValue: { value: () => 'api' } }]
    });

    service = TestBed.inject(SpeakerService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('is an empty list on a site with no season', async () => {
    const result = firstValueFrom(service.getParticipatingPresenters());

    http
      .expectOne('api/speakers/participating')
      .flush({ message: 'No active season found.', statusCode: 404 }, { status: 404, statusText: 'Not Found' });

    await expect(result).resolves.toEqual([]);
  });

  it('still fails on any other error', async () => {
    const result = firstValueFrom(service.getParticipatingPresenters());

    http.expectOne('api/speakers/participating').flush('Down.', { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toBeTruthy();
  });
});

/**
 * #441: the admin Speakers list reads each speaker's sessions from the speakers' own route behind update:speakers, not
 * from the public season list, which leaves them out because they include sessions hidden from the public schedule.
 */
describe('SpeakerService, the speakers with their sessions (#441)', () => {
  let service: SpeakerService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: EnvironmentService, useValue: { value: () => 'api' } }]
    });

    service = TestBed.inject(SpeakerService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("reads a season's speakers with their sessions from the guarded route", async () => {
    const result = firstValueFrom(service.getEntitiesWithSessionsForSeason('s-1'));

    http.expectOne('api/speakers/sessions/season/s-1').flush([{ guid: 'sp-1', events: [] }]);

    await expect(result).resolves.toEqual([{ guid: 'sp-1', events: [] }]);
  });

  it("reads the active season's, and is an empty list on a site with no season", async () => {
    const result = firstValueFrom(service.getEntitiesWithSessionsForActiveSeason());

    http
      .expectOne('api/speakers/sessions/season/active')
      .flush({ message: 'No active season found.', statusCode: 404 }, { status: 404, statusText: 'Not Found' });

    await expect(result).resolves.toEqual([]);
  });
});
