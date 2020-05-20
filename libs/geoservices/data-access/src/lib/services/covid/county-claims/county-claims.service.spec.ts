import { TestBed } from '@angular/core/testing';

import { CountyClaimsService } from './county-claims.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('CountyClaimsService', () => {
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
    const service: CountyClaimsService = TestBed.get(CountyClaimsService);
    expect(service).toBeTruthy();
  });
});
