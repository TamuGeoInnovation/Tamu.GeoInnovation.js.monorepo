import { TestBed } from '@angular/core/testing';

import { TestingSitesService } from './testing-sites.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('TestingSitesService', () => {
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
    const service: TestingSitesService = TestBed.get(TestingSitesService);
    expect(service).toBeTruthy();
  });
});
