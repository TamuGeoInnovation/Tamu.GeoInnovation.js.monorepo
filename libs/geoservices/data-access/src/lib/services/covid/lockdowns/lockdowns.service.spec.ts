import { TestBed } from '@angular/core/testing';

import { LockdownsService } from './lockdowns.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

describe('LockdownsService', () => {
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
    const service: LockdownsService = TestBed.get(LockdownsService);
    expect(service).toBeTruthy();
  });
});
