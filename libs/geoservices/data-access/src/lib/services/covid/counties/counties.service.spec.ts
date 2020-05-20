import { TestBed } from '@angular/core/testing';

import { CountiesService } from './counties.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('CountiesService', () => {
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
    const service: CountiesService = TestBed.get(CountiesService);
    expect(service).toBeTruthy();
  });
});
