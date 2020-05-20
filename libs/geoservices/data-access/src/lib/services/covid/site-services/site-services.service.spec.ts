import { TestBed } from '@angular/core/testing';

import { SiteServicesService } from './site-services.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('SiteServicesService', () => {
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
    const service: SiteServicesService = TestBed.get(SiteServicesService);
    expect(service).toBeTruthy();
  });
});
