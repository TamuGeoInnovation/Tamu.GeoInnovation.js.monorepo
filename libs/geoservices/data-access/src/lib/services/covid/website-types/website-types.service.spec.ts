import { TestBed } from '@angular/core/testing';

import { WebsiteTypesService } from './website-types.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('WebsiteTypesService', () => {
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
    const service: WebsiteTypesService = TestBed.get(WebsiteTypesService);
    expect(service).toBeTruthy();
  });
});
