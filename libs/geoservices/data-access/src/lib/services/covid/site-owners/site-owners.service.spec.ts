import { TestBed } from '@angular/core/testing';

import { SiteOwnersService } from './site-owners.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('SiteOwnersService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, EnvironmentModule],
    providers: [
      {
        provide: env, 
        useValue: { covid_api_url : 'https://' }
      }
    ]
  }));

  it('should be created', () => {
    const service: SiteOwnersService = TestBed.get(SiteOwnersService);
    expect(service).toBeTruthy();
  });
});
