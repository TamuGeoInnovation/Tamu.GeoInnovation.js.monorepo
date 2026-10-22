import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
class ThingService extends BaseService<{ guid: string }> {
  constructor() {
    super('things');
  }
}

/**
 * Regression coverage (#2076). On a new site with no season, every `<resource>/season/active` answers
 * 404 ("No active season found."). The homepage's and About's Participating Organizations, and the
 * footer's partners, waited for ever on that answer. With no season there are none of anything for it.
 */
describe('BaseService.getEntitiesForActiveSeason()', () => {
  let service: ThingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: EnvironmentService, useValue: { value: () => 'api' } }]
    });

    service = TestBed.inject(ThingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("is the active season's records", async () => {
    const result = firstValueFrom(service.getEntitiesForActiveSeason());

    http.expectOne('api/things/season/active').flush([{ guid: 'a' }]);

    await expect(result).resolves.toEqual([{ guid: 'a' }]);
  });

  it('is an empty list on a site with no season', async () => {
    const result = firstValueFrom(service.getEntitiesForActiveSeason());

    http
      .expectOne('api/things/season/active')
      .flush({ message: 'No active season found.', statusCode: 404 }, { status: 404, statusText: 'Not Found' });

    await expect(result).resolves.toEqual([]);
  });

  it('still fails on any other error', async () => {
    const result = firstValueFrom(service.getEntitiesForActiveSeason());

    http.expectOne('api/things/season/active').flush('Down.', { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toBeTruthy();
  });
});
