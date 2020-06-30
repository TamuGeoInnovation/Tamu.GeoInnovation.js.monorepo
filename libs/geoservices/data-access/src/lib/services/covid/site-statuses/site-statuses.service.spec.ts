import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SiteStatusesService } from './site-statuses.service';

describe('SiteStatusesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: SiteStatusesService = TestBed.get(SiteStatusesService);
    expect(service).toBeTruthy();
  });
});
