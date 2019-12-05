import { TestBed } from '@angular/core/testing';

import { SitesService } from './sites.service';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SitesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'http://' }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: SitesService = TestBed.get(SitesService);
    expect(service).toBeTruthy();
  });
});
